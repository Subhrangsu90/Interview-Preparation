import { Component, input, model, output } from '@angular/core';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'ui-pagination',
  standalone: true,
  imports: [MatPaginatorModule],
  template: `
    <mat-paginator
      [length]="length()"
      [pageSize]="pageSize()"
      [pageIndex]="pageIndex()"
      [pageSizeOptions]="pageSizeOptions()"
      [showFirstLastButtons]="showFirstLastButtons()"
      [attr.aria-label]="ariaLabel()"
      (page)="onPage($event)"
      class="ui-paginator"
    />
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
    }

    .ui-paginator {
      border-top: 1px solid var(--mat-sys-outline-variant, #e2e8f0);
      background: transparent;
    }
  `,
})
export class UiPagination {
  readonly length = input<number>(0);
  readonly pageSize = model<number>(10);
  readonly pageIndex = model<number>(0);
  readonly pageSizeOptions = input<number[]>([10, 25, 50, 100]);
  readonly showFirstLastButtons = input<boolean>(true);
  readonly ariaLabel = input<string>('Select page');

  readonly pageChange = output<PageEvent>();

  onPage(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.pageChange.emit(event);
  }
}
