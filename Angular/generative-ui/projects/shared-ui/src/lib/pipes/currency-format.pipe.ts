import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'uiCurrency',
  standalone: true,
})
export class UiCurrencyPipe implements PipeTransform {
  transform(
    value: number | string | null | undefined,
    currencyCode = 'USD',
    currencyDisplay: 'symbol' | 'code' | 'narrowSymbol' = 'symbol',
    digits = 2
  ): string {
    if (value === null || value === undefined || value === '') {
      return '';
    }

    const num = typeof value === 'number' ? value : parseFloat(value);
    if (isNaN(num)) {
      return String(value);
    }

    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyCode,
        currencyDisplay,
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      }).format(num);
    } catch {
      return `$${num.toFixed(digits)}`;
    }
  }
}
