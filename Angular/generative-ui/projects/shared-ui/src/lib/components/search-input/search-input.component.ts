import { Component, input, model, output } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'ui-search-input',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule],
  template: `
    <mat-form-field appearance="outline" subscriptSizing="dynamic" class="ui-search-field">
      <mat-icon matPrefix class="search-icon">search</mat-icon>
      <input
        matInput
        [placeholder]="placeholder()"
        [attr.aria-label]="ariaLabel()"
        [value]="value()"
        (input)="onInputChange($event)"
        (keyup.enter)="onEnter()"
      />
      @if (value()) {
        <button
          mat-icon-button
          matSuffix
          type="button"
          (click)="onClear()"
          [attr.aria-label]="'Clear ' + ariaLabel()"
        >
          <mat-icon>close</mat-icon>
        </button>
      }
    </mat-form-field>
  `,
  styles: `
    :host {
      display: inline-block;
      width: 100%;
      max-width: 420px;
    }

    .ui-search-field {
      width: 100%;

      .search-icon {
        color: var(--mat-sys-on-surface-variant, #64748b);
        margin-right: 8px;
      }
    }
  `,
})
export class UiSearchInput {
  readonly value = model<string>('');
  readonly placeholder = input<string>('Search...');
  readonly ariaLabel = input<string>('Search');

  readonly searchChange = output<string>();
  readonly cleared = output<void>();

  onInputChange(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.value.set(val);
    this.searchChange.emit(val);
  }

  onEnter(): void {
    this.searchChange.emit(this.value());
  }

  onClear(): void {
    this.value.set('');
    this.cleared.emit();
    this.searchChange.emit('');
  }
}
