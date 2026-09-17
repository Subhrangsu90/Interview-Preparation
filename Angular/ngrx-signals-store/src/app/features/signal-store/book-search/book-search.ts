import { Component, effect, inject, OnInit } from '@angular/core';
import { JsonPipe, NgClass } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatChip, MatChipSet } from '@angular/material/chips';
import { BookSearchStore } from './store/book-search-store';
import { BookFilter } from './book-filter';
import { BookList } from './book-list';
import { LoggerService } from 'logger';

@Component({
  selector: 'app-book-search',
  imports: [
    BookFilter,
    BookList,
    MatIcon,
    MatChip,
    MatChipSet,
    JsonPipe
  ],
  templateUrl: './book-search.html',
  styleUrl: './book-search.scss',
  providers: [BookSearchStore],
})
export class BookSearch {
  private readonly logger = inject(LoggerService);
  readonly store = inject(BookSearchStore);

  constructor() {
    this.store.loadAll();

    const query = this.store.filter.query;
    // 👇 Re-fetch books whenever the value of query signal changes.
    this.store.loadByQuery(query);

    effect(() => {
      this.logger.info('book-search', `Loading: ${this.store.isLoading()}`);
      this.logger.info('book-search', `Books Count: ${this.store.booksCount()}`);
      this.logger.info('book-search', `Filter: ${JSON.stringify(this.store.filter())}`);
      this.logger.info('book-search', `Sorted Books: ${JSON.stringify(this.store.sortedBooks())}`);
    });
  }


}


