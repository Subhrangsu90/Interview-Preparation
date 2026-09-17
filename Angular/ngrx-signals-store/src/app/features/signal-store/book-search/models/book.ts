import { z } from 'zod';

export interface Book {
    id: number;
    title: string;
}

export interface BookSearchState {
    books: Book[],
    isLoading: boolean,
    filter: {
        query: string;
        order: 'asc' | 'desc';
    }
}
