import { Component, input } from '@angular/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatIcon } from '@angular/material/icon';
import { Book } from './models/book';

@Component({
  selector: 'ngrx-book-list',
  imports: [MatProgressSpinner, MatIcon],
  template: `
    @if (isLoading()) {
      <div class="loading-state">
        <mat-progress-spinner mode="indeterminate" diameter="40"></mat-progress-spinner>
        <p>Loading books from store service...</p>
      </div>
    } @else if (books().length === 0) {
      <div class="empty-state">
        <mat-icon class="empty-icon">search_off</mat-icon>
        <p class="empty-msg">No books found matching criteria</p>
      </div>
    } @else {
      <div class="book-list">
        @for (book of books(); track book.id) {
          <div class="book-card">
            <div class="book-id-badge">#{{ book.id }}</div>
            <div class="book-details">
              <span class="book-title">{{ book.title }}</span>
            </div>
            <mat-icon class="book-arrow">bookmark_border</mat-icon>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem 1rem;
      gap: 1rem;
      color: var(--mat-sys-on-surface-variant, #666);
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2.5rem 1rem;
      text-align: center;

      .empty-icon {
        font-size: 40px;
        width: 40px;
        height: 40px;
        color: #aaa;
        margin-bottom: 0.5rem;
      }

      .empty-msg {
        margin: 0;
        color: var(--mat-sys-on-surface-variant, #666);
      }
    }

    .book-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;

      .book-card {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 0.85rem 1rem;
        border-radius: 8px;
        background: var(--mat-sys-surface-container-low, #f7f2fa);
        border: 1px solid var(--mat-sys-outline-variant, #ece6f0);
        transition: transform 0.15s ease, box-shadow 0.15s ease;


        .book-id-badge {
          font-size: 0.8rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 6px;
          background: rgba(103, 58, 183, 0.1);
          color: #673ab7;
        }

        .book-details {
          flex: 1;

          .book-title {
            font-size: 0.95rem;
            font-weight: 500;
            color: var(--mat-sys-on-surface, #1d1b20);
          }
        }

        .book-arrow {
          color: var(--mat-sys-outline, #79747e);
          font-size: 18px;
          width: 18px;
          height: 18px;
        }
      }
    }
  `],
})
export class BookList {
  readonly books = input.required<Book[]>();
  readonly isLoading = input.required<boolean>();
}
