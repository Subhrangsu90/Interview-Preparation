import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { UiLoadingService } from '@shared/ui';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(UiLoadingService);

  loadingService.show();

  return next(req).pipe(
    finalize(() => {
      loadingService.hide();
    })
  );
};
