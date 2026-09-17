import { Service } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { Book as BookType } from '../models/book';

@Service()
export class Books {
  private readonly mockBooks: BookType[] = [
    { id: 1, title: 'Clean Architecture: A Craftsman\'s Guide' },
    { id: 2, title: 'Designing Data-Intensive Applications' },
    { id: 3, title: 'Refactoring: Improving the Design of Existing Code' },
    { id: 4, title: 'The Pragmatic Programmer: Your Journey to Mastery' },
    { id: 5, title: 'Learning TypeScript: Enhance Your Web Development' },
    { id: 6, title: 'Angular Projects: Build Modern Web Applications' },
    { id: 7, title: 'Enterprise Angular: Micro Frontends and Monorepos' },
    { id: 8, title: 'Domain-Driven Design: Tackling Complexity in Software' },
    { id: 9, title: 'Structure and Interpretation of Computer Programs' },
    { id: 10, title: 'Design Patterns: Elements of Reusable Object-Oriented Software' },
  ];

  getByQuery(query: string): Observable<BookType[]> {
    const q = (query || '').trim().toLowerCase();
    const filtered = q
      ? this.mockBooks.filter((book) => book.title.toLowerCase().includes(q))
      : [...this.mockBooks];

    return of(filtered).pipe(delay(200));
  }

  getAll(): Promise<BookType[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...this.mockBooks]), 200);
    });
  }
}

// Alias to support both Books and BooksService naming
export { Books as BooksService };


