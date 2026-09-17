import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormField, MatLabel, MatPrefix, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect, MatOption } from '@angular/material/select';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';

@Component({
  selector: 'ngrx-book-filter',
  imports: [
    FormsModule,
    MatFormField,
    MatLabel,
    MatPrefix,
    MatSuffix,
    MatInput,
    MatSelect,
    MatOption,
    MatIcon,
    MatIconButton,
  ],
  template: `
    <div class="filter-controls">
      <mat-form-field appearance="outline" class="search-field">
        <mat-label>Search Books by Title</mat-label>
        <mat-icon matPrefix>search</mat-icon>
        <input
          matInput
          [ngModel]="query()"
          (ngModelChange)="queryChange.emit($event)"
          placeholder="e.g. Architecture, Angular, TypeScript..."
        />
        @if (query()) {
          <button mat-icon-button matSuffix (click)="queryChange.emit('')" aria-label="Clear search">
            <mat-icon>close</mat-icon>
          </button>
        }
      </mat-form-field>

      <mat-form-field appearance="outline" class="order-field">
        <mat-label>Sort Order</mat-label>
        <mat-icon matPrefix>sort_by_alpha</mat-icon>
        <mat-select
          [ngModel]="order()"
          (ngModelChange)="orderChange.emit($event)"
        >
          <mat-option value="asc">Ascending (A-Z)</mat-option>
          <mat-option value="desc">Descending (Z-A)</mat-option>
        </mat-select>
      </mat-form-field>
    </div>
  `,
  styles: [`
    .filter-controls {
      display: flex;
      gap: 1rem;
      align-items: center;
      flex-wrap: wrap;

      .search-field {
        flex: 1;
        min-width: 260px;
        margin-bottom: -1.25rem;
      }

      .order-field {
        width: 200px;
        margin-bottom: -1.25rem;
      }
    }
  `],
})
export class BookFilter {
  readonly query = input.required<string>();
  readonly order = input.required<'asc' | 'desc'>();
  readonly queryChange = output<string>();
  readonly orderChange = output<'asc' | 'desc'>();
}
