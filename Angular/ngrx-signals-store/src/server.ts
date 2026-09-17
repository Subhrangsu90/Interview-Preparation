import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

// Parse JSON request bodies
app.use(express.json());

const mockBooks = [
  { id: 1, title: "Clean Architecture: A Craftsman's Guide" },
  { id: 2, title: "Designing Data-Intensive Applications" },
  { id: 3, title: "Refactoring: Improving the Design of Existing Code" },
  { id: 4, title: "The Pragmatic Programmer: Your Journey to Mastery" },
  { id: 5, title: "Learning TypeScript: Enhance Your Web Development" },
  { id: 6, title: "Angular Projects: Build Modern Web Applications" },
  { id: 7, title: "Enterprise Angular: Micro Frontends and Monorepos" },
  { id: 8, title: "Domain-Driven Design: Tackling Complexity in Software" },
  { id: 9, title: "Structure and Interpretation of Computer Programs" },
  { id: 10, title: "Design Patterns: Elements of Reusable Object-Oriented Software" },
];

/**
 * Express REST API for Books
 */
app.get('/api/books', (req, res) => {
  const queryParam = req.query['query'] ?? req.query['q'] ?? '';
  const query = (typeof queryParam === 'string' ? queryParam : '').trim().toLowerCase();

  const filtered = query
    ? mockBooks.filter((book) => book.title.toLowerCase().includes(query))
    : mockBooks;

  res.json(filtered);
});

app.get('/api/books/:id', (req, res) => {
  const id = Number(req.params.id);
  const book = mockBooks.find((item) => item.id === id);

  if (!book) {
    res.status(404).json({ message: 'Book not found' });
    return;
  }

  res.json(book);
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use(async (req, res, next) => {
  try {
    let response = await angularApp.handle(req);

    // If SSR could not match the route (e.g. secondary outlets like (overview:overview) or client-only routes),
    // serve the SPA shell so the browser-side router can handle the URL.
    if (!response) {
      const fallbackReq = new Proxy(req, {
        get(target, prop, receiver) {
          if (prop === 'url' || prop === 'originalUrl') {
            return '/dashboard';
          }
          return Reflect.get(target, prop, receiver);
        },
      });
      response = await angularApp.handle(fallbackReq);
    }

    if (response) {
      writeResponseToNodeResponse(response, res);
    } else {
      next();
    }
  } catch (err) {
    next(err);
  }
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
