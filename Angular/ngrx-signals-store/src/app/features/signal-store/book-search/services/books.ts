import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { Book as BookType } from '../models/book';

@Service()
export class Books {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/books';

  getByQuery(query: string): Observable<BookType[]> {
    const params = new HttpParams().set('query', query || '');
    return this.http.get<BookType[]>(this.apiUrl, { params });
  }

  getAll(): Promise<BookType[]> {
    return firstValueFrom(this.http.get<BookType[]>(this.apiUrl));
  }
}

// Alias to support both Books and BooksService naming
export { Books as BooksService };


