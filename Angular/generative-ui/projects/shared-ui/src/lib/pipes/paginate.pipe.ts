import { Pipe, PipeTransform } from '@angular/core';

export function paginateSlice<T>(
  items: T[] | null | undefined,
  pageIndex = 0,
  pageSize = 10
): T[] {
  if (!items || items.length === 0 || pageSize <= 0) {
    return [];
  }
  const maxIndex = Math.max(0, Math.ceil(items.length / pageSize) - 1);
  const index = Math.min(Math.max(0, pageIndex), maxIndex);
  const start = index * pageSize;
  return items.slice(start, start + pageSize);
}

@Pipe({
  name: 'uiPaginate',
  standalone: true,
  pure: true,
})
export class UiPaginatePipe implements PipeTransform {
  transform<T>(
    items: T[] | null | undefined,
    pageIndex = 0,
    pageSize = 10
  ): T[] {
    return paginateSlice(items, pageIndex, pageSize);
  }
}
