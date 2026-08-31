import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConfirmDialogData, UiConfirmDialog } from './confirm-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class UiConfirmService {
  private readonly dialog = inject(MatDialog);

  confirm(options: ConfirmDialogData): Observable<boolean> {
    const dialogRef = this.dialog.open<UiConfirmDialog, ConfirmDialogData, boolean>(
      UiConfirmDialog,
      {
        data: options,
        width: '440px',
        maxWidth: '90vw',
        autoFocus: false,
        disableClose: false,
      }
    );

    return dialogRef.afterClosed().pipe(map((result) => !!result));
  }
}
