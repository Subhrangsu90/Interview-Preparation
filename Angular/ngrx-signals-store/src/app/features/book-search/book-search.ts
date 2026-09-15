import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-book-search',
  imports: [RouterLink, MatButtonModule, MatIconModule],
  templateUrl: './book-search.html',
  styleUrl: './book-search.scss',
})
export class BookSearch {}
