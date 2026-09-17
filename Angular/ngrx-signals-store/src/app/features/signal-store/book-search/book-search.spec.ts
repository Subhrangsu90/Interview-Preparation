import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideLogger } from 'logger';
import { of } from 'rxjs';
import { BookSearch } from './book-search';
import { Books } from './services/books';

describe('BookSearch', () => {
  let component: BookSearch;
  let fixture: ComponentFixture<BookSearch>;

  beforeEach(async () => {
    const mockBooksService = {
      getAll: () => Promise.resolve([]),
      getByQuery: () => of([]),
    };

    await TestBed.configureTestingModule({
      imports: [BookSearch],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideLogger(),
        { provide: Books, useValue: mockBooksService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BookSearch);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
