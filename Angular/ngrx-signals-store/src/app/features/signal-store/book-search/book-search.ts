import { Component, inject } from '@angular/core';
import { JsonPipe, NgClass } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatChip, MatChipSet } from '@angular/material/chips';
import { BookSearchStore } from './store/book-search-store';
import { BookFilter } from './book-filter';
import { BookList } from './book-list';

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
  readonly store = inject(BookSearchStore);

  constructor() {
    const query = this.store.filter.query;
    // 👇 Re-fetch books whenever the value of query signal changes.
    this.store.loadByQuery(query);
  }
}


