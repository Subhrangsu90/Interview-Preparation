# Generative-UI Workspace Instructions & Architecture Blueprint

This document defines the architecture, design patterns, conventions, and step-by-step recipes for any AI agent or developer extending or maintaining this project.

---

## 1. Project High-Level Architecture

The project is a full-stack, enterprise-grade Angular monorepo featuring **Generative UI**, **Angular Material 3**, a **Decoupled Library System**, and an **Express + PostgreSQL + Drizzle ORM** backend.

```
generative-ui/
├── projects/                      # Standalone Libraries (built with ng-packagr)
│   ├── core/                      # Low-level HTTP ApiService, tokens, network error mapping
│   ├── event-bus/                 # Decoupled cross-feature pub/sub event bus & telemetry
│   └── shared-ui/                 # Design system: reusable atomic UI components, pipes, directives
├── src/                           # Main Angular 22+ SSR Application
│   ├── app/
│   │   ├── core/                  # App-specific models (Zod), services (Signals), interceptors
│   │   ├── features/              # Routed feature views (orders, support, chat, events, dashboard)
│   │   ├── shared/                # App-level shared layout components (header, sidenav)
│   │   ├── app.config.ts          # App bootstrap providers & interceptors
│   │   └── app.routes.ts          # Lazy-loaded route definitions with view transitions
│   ├── environments/              # Environment configs with schema validation
│   └── styles.scss                # Material 3 Theming, Mulish typography & global widget styles
└── server/                        # Express 5 + Drizzle ORM + PostgreSQL Backend
    └── src/
        ├── controllers/           # HTTP Request / Response controllers (standard envelopes)
        ├── db/                    # Drizzle schema (pgTable) & connection pool
        ├── middleware/            # Zod validation & centralized error handler
        ├── routes/                # Express API route modules
        ├── schemas/               # Zod validation schemas (params, query, body)
        └── service/               # Database queries & business logic
```

---

## 2. Technology Stack & Key Patterns

- **Framework**: Angular 22+ (SSR enabled, hydration, view transitions).
- **Component Model**: 100% Standalone components (`standalone: true` or default).
- **Reactivity Model**: Angular Signals (`signal()`, `computed()`, `model()`, `input()`, `output()`). **Never use `@Input()`, `@Output()`, or unnecessary BehaviorSubjects in components.**
- **Runtime Validation & Types**: **Zod** (`z.object(...)`, `z.infer<typeof schema>`). Every model is defined as a Zod schema and parsed using `safeParse()` inside services.
- **HTTP Client**: Do NOT inject raw `HttpClient` directly into feature services. Inject `ApiService` from `@core/api`.
- **Event Bus / Telemetry**: Cross-feature communication uses `EventBusService` from `@event-bus/services` and `[trackEvent]` directive.
- **Theming & CSS**: Angular Material 3 with `@include mat.theme(...)`. Primary: `mat.$cyan-palette`, Tertiary: `mat.$orange-palette`. Mulish typography. Always use `--mat-sys-*` CSS variables instead of hardcoded hex values for surfaces/borders.
- **Backend**: Express 5, Drizzle ORM, PostgreSQL, Zod request validation.

---

## 3. Path Aliases (`tsconfig.json`)

Always use the configured TypeScript path aliases instead of relative directory traversals:

| Alias | Target Directory | Usage |
| :--- | :--- | :--- |
| `@app/*` | `./src/app/*` | Application root |
| `@core/*` | `./src/app/core/*` | Domain models, services, interceptors |
| `@features/*` | `./src/app/features/*` | Routed feature modules |
| `@shared/*` | `./src/app/shared/*` | Application-level shared components |
| `@env` | `./src/environments/environment.ts` | Active environment constants & endpoints |
| `@shared/ui/*` | `./projects/shared-ui/src/lib/*` | Shared UI components, pipes, directives |
| `@event-bus/*` | `./projects/event-bus/src/lib/*` | Event bus models, services, directives |
| `@core/api` | `./projects/core/src/public-api.ts` | Low-level ApiService and tokens |

---

## 4. Decision Matrix: Where Does New Code Belong?

| If you want to add... | Place it in... | Conventions to Follow |
| :--- | :--- | :--- |
| **Reusable UI Component** (Button, Badge, Modal, Card) | `projects/shared-ui/src/lib/components/<name>/` | Prefix: `ui-<name>`, Class: `Ui<Name>`. Export in `public-api.ts`. Use Signals (`input`, `output`). |
| **Reusable Pipe or Directive** | `projects/shared-ui/src/lib/pipes/` or `directives/` | Prefix: `ui<Name>`, Class: `Ui<Name>Pipe`. Export in `public-api.ts`. |
| **Domain Entity / Data Model** | `src/app/core/models/<entity>.models.ts` | Define Zod schema first. Export `type Entity = z.infer<typeof schema>`. |
| **Frontend API Service** | `src/app/core/services/<entity>.service.ts` | Inject `ApiService`. Store data in `signal<T[]>`. Validate responses with `safeParse()`. |
| **New Routed Screen / Feature** | `src/app/features/<feature>/` | Standalone component with `app-<feature>` selector. Add route to `app.routes.ts` with `loadComponent`. |
| **New Generative UI Widget** | 1. Model: `src/app/core/models/chat.models.ts`<br>2. Service: `src/app/core/services/ai-chat.service.ts`<br>3. View: `src/app/features/chat/chat.html` | Add to `generativeWidgetSchema` discriminated union. Render in `chat.html` with Material & Shared UI. |
| **Database Table** | `server/src/db/schema.ts` | Define using `pgTable()`. Generate migration via `npm run db:generate` & `npm run db:migrate`. |
| **Backend API Route & Logic** | `server/src/schemas/`, `server/src/routes/`, `server/src/controllers/`, `server/src/service/` | Zod schema validation middleware -> Controller -> Service (Drizzle queries) -> Standard response envelope. |

---

## 5. Step-by-Step Implementation Blueprints

### 5.1. Adding a Reusable Component to `projects/shared-ui`
1. Create directory `projects/shared-ui/src/lib/components/<component-name>/`.
2. Create `<component-name>.component.ts`:
   ```typescript
   import { Component, input, output } from '@angular/core';

   @Component({
     selector: 'ui-my-card',
     standalone: true,
     imports: [],
     template: `
       <div class="ui-my-card">
         <h3>{{ title() }}</h3>
         <button (click)="action.emit()">Click</button>
       </div>
     `,
     styles: [`
       .ui-my-card {
         background: var(--mat-sys-surface, #ffffff);
         border: 1px solid var(--mat-sys-outline-variant, #e2e8f0);
         border-radius: 12px;
         padding: 16px;
       }
     `],
   })
   export class UiMyCard {
     readonly title = input.required<string>();
     readonly action = output<void>();
   }
   ```
3. Create `index.ts` in that folder:
   ```typescript
   export * from './my-card.component';
   ```
4. Register the export in `projects/shared-ui/src/public-api.ts`:
   ```typescript
   export * from './lib/components/my-card/my-card.component';
   ```
5. Build the library if tested in package form: `ng build shared-ui`.

---

### 5.2. Adding a Model (Zod + TypeScript)
Create or edit `src/app/core/models/<name>.models.ts`:
```typescript
import { z } from 'zod';

export const productSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().trim().min(1, 'Title is required'),
  price: z.number().nonnegative(),
  category: z.string(),
  createdAt: z.union([z.string(), z.date()]),
});

export type Product = z.infer<typeof productSchema>;

export const createProductDtoSchema = productSchema.omit({ id: true, createdAt: true });
export type CreateProductDto = z.infer<typeof createProductDtoSchema>;
```

---

### 5.3. Adding a Frontend Service
Create `src/app/core/services/<name>.service.ts`:
```typescript
import { Injectable, inject, signal } from '@angular/core';
import { ApiService, ApiError } from '@core/api';
import { EventBusService } from '@event-bus/services';
import { environment } from '@env';
import { map, catchError, throwError, Observable } from 'rxjs';
import { Product, productSchema } from '../models/product.models';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly api = inject(ApiService);
  private readonly eventBus = inject(EventBusService, { optional: true });

  // State Signals
  readonly products = signal<Product[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  loadProducts(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.api
      .get<Product[]>('products', { unwrapEnvelope: true })
      .pipe(
        map((raw) => {
          const parsed = productSchema.array().safeParse(raw ?? []);
          return parsed.success ? parsed.data : (raw ?? []);
        }),
        catchError((err: ApiError) => {
          this.error.set(err.message || 'Failed to fetch products');
          this.isLoading.set(false);
          return throwError(() => err);
        })
      )
      .subscribe({
        next: (data) => {
          this.products.set(data);
          this.isLoading.set(false);
          this.eventBus?.emit({
            source: 'service',
            category: 'data',
            name: 'PRODUCTS_LOADED',
            payload: { count: data.length },
          });
        },
        error: () => this.isLoading.set(false),
      });
  }
}
```

---

### 5.4. Adding a New Feature / Page
1. Create `src/app/features/<feature>/<feature>.ts`, `<feature>.html`, `<feature>.scss`:
   ```typescript
   import { Component, inject, OnInit } from '@angular/core';
   import { CommonModule } from '@angular/common';
   import { MatCardModule } from '@angular/material/card';
   import { MatButtonModule } from '@angular/material/button';
   import { UiPageHeader } from '@shared/ui/components/page-header';
   import { TrackEventDirective } from '@event-bus/directives';
   import { ProductService } from '@core/services/product.service';

   @Component({
     selector: 'app-products',
     standalone: true,
     imports: [CommonModule, MatCardModule, MatButtonModule, UiPageHeader, TrackEventDirective],
     templateUrl: './products.html',
     styleUrl: './products.scss',
   })
   export class ProductsComponent implements OnInit {
     protected readonly productService = inject(ProductService);

     ngOnInit(): void {
       this.productService.loadProducts();
     }
   }
   ```
2. Register in `src/app/app.routes.ts`:
   ```typescript
   {
     path: 'products',
     loadComponent: () => import('./features/products/products').then((m) => m.ProductsComponent),
   },
   ```
3. Add navigation link in `src/app/shared/components/sidenav/sidenav.html` if required.

---

### 5.5. Adding a Generative UI Widget
1. **Define Payload Schema** in `src/app/core/models/chat.models.ts`:
   ```typescript
   export const invoiceWidgetPayloadSchema = z.object({
     invoiceNumber: z.string(),
     amountDue: z.number(),
     dueDate: z.string(),
     status: z.enum(['paid', 'unpaid', 'overdue']),
   });
   export type InvoiceWidgetPayload = z.infer<typeof invoiceWidgetPayloadSchema>;

   // Add to discriminated union:
   export const generativeWidgetSchema = z.discriminatedUnion('type', [
     z.object({ type: z.literal('order_status'), data: orderWidgetPayloadSchema }),
     z.object({ type: z.literal('return_guide'), data: returnWidgetPayloadSchema }),
     z.object({ type: z.literal('metrics_summary'), data: metricsWidgetPayloadSchema }),
     z.object({ type: z.literal('invoice_detail'), data: invoiceWidgetPayloadSchema }), // NEW
   ]);
   ```
2. **Handle In Service** (`src/app/core/services/ai-chat.service.ts`):
   In `synthesizeReply(prompt, model)` add pattern matching returning `{ text, widget: { type: 'invoice_detail', data: {...} } }`.
3. **Render Widget** in `src/app/features/chat/chat.html`:
   ```html
   @if (msg.generativeWidget.type === 'invoice_detail') {
     <div class="widget-card invoice-widget">
       <div class="widget-header">
         <span class="font-mono">{{ msg.generativeWidget.data.invoiceNumber }}</span>
         <ui-status-badge [status]="msg.generativeWidget.data.status" />
       </div>
       <div class="widget-body">
         <p>Amount: {{ msg.generativeWidget.data.amountDue | uiCurrency }}</p>
         <p>Due: {{ msg.generativeWidget.data.dueDate }}</p>
       </div>
     </div>
   }
   ```

---

### 5.6. Adding a Backend Endpoint (Express + Drizzle ORM)
1. **Schema** (`server/src/db/schema.ts`):
   ```typescript
   export const products = pgTable('products', {
     id: serial('id').primaryKey(),
     title: varchar('title', { length: 255 }).notNull(),
     price: numeric('price', { precision: 10, scale: 2 }).notNull(),
     createdAt: timestamp('created_at').notNull().defaultNow(),
   });
   ```
2. **Validation** (`server/src/schemas/product.schema.ts`):
   ```typescript
   import { z } from 'zod';
   export const createProductSchema = z.object({
     title: z.string().min(1),
     price: z.number().positive(),
   });
   ```
3. **Service** (`server/src/service/product.service.ts`):
   ```typescript
   import { db } from '../db/index.js';
   import { products } from '../db/schema.js';

   export class ProductService {
     async getAll() {
       return db.select().from(products);
     }
   }
   export const productService = new ProductService();
   ```
4. **Controller** (`server/src/controllers/product.controller.ts`):
   ```typescript
   import type { Request, Response, NextFunction } from 'express';
   import { productService } from '../service/product.service.js';

   export class ProductController {
     async getAll(req: Request, res: Response, next: NextFunction) {
       try {
         const data = await productService.getAll();
         res.json({ status: 'success', data });
       } catch (err) {
         next(err);
       }
     }
   }
   export const productController = new ProductController();
   ```
5. **Route** (`server/src/routes/product.route.ts`):
   ```typescript
   import { Router } from 'express';
   import { productController } from '../controllers/product.controller.js';

   const router = Router();
   router.get('/', (req, res, next) => productController.getAll(req, res, next));
   export const productRouter = router;
   ```
6. **Mount in `server/src/routes/index.ts`**:
   ```typescript
   import { productRouter } from './product.route.js';
   router.use('/products', productRouter);
   ```

---

## 6. Verification and Quality Checklist

Before submitting code, always run:
1. `npm run build` or `ng build` to ensure all TypeScript types, Angular templates, and library paths compile cleanly.
2. If library code was touched: `ng build shared-ui` (or `core`, `event-bus`).
3. For server code: test endpoints against `http://localhost:3000/api/...` or with `tsx watch server/src/index.ts`.
4. Ensure no `@Input` / `@Output` decorators were introduced; use modern `input()` and `output()`.
5. Ensure no untyped `any` was used; maintain complete Zod schema coverage.
