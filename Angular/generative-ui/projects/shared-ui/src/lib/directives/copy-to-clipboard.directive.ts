import { Directive, HostListener, inject, input, output } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Directive({
  selector: '[uiCopyToClipboard]',
  standalone: true,
})
export class UiCopyToClipboardDirective {
  private readonly snackBar = inject(MatSnackBar);

  readonly uiCopyToClipboard = input.required<string>();
  readonly copySuccessMessage = input<string>('Copied to clipboard!');
  readonly copyDuration = input<number>(2500);

  readonly copied = output<string>();

  @HostListener('click', ['$event'])
  async onClick(event: MouseEvent): Promise<void> {
    event.stopPropagation();
    const text = this.uiCopyToClipboard();
    if (!text) return;

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for non-secure contexts
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }

      this.snackBar.open(this.copySuccessMessage(), 'Close', {
        duration: this.copyDuration(),
        horizontalPosition: 'end',
        verticalPosition: 'bottom',
      });

      this.copied.emit(text);
    } catch {
      this.snackBar.open('Failed to copy to clipboard', 'Close', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'bottom',
      });
    }
  }
}
