import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApiService } from './api.service';
import { provideApiBaseUrl } from './api.tokens';
import { ApiError } from './api-error.model';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideApiBaseUrl('/api')],
    });

    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('resolveUrl', () => {
    it('should combine default base URL and endpoint', () => {
      expect(service.resolveUrl('orders')).toBe('/api/orders');
      expect(service.resolveUrl('/orders')).toBe('/api/orders');
    });

    it('should use custom base URL override when provided', () => {
      expect(service.resolveUrl('orders', 'https://api.external.com/v1')).toBe(
        'https://api.external.com/v1/orders'
      );
    });

    it('should not modify absolute URLs', () => {
      expect(service.resolveUrl('https://api.example.com/items')).toBe(
        'https://api.example.com/items'
      );
    });
  });

  describe('buildParams', () => {
    it('should omit null, undefined, and empty string params', () => {
      const params = service.buildParams({
        search: 'electronics',
        page: 1,
        active: true,
        empty: '',
        nil: null,
        undef: undefined,
      });

      expect(params.get('search')).toBe('electronics');
      expect(params.get('page')).toBe('1');
      expect(params.get('active')).toBe('true');
      expect(params.has('empty')).toBe(false);
      expect(params.has('nil')).toBe(false);
      expect(params.has('undef')).toBe(false);
    });

    it('should handle array parameters', () => {
      const params = service.buildParams({
        status: ['shipped', 'delivered'],
      });

      expect(params.getAll('status')).toEqual(['shipped', 'delivered']);
    });
  });

  describe('HTTP operations', () => {
    it('should issue GET request and return data', () => {
      const mockOrders = [{ id: '1', orderNumber: 'ORD-1001' }];

      service
        .get<{ id: string; orderNumber: string }[]>('orders')
        .subscribe((data: { id: string; orderNumber: string }[]) => {
          expect(data).toEqual(mockOrders);
        });

      const req = httpMock.expectOne('/api/orders');
      expect(req.request.method).toBe('GET');
      req.flush(mockOrders);
    });

    it('should automatically unwrap envelope when unwrapEnvelope is true', () => {
      const envelope = { success: true, data: [{ id: '1' }] };

      service
        .get<{ id: string }[]>('orders', { unwrapEnvelope: true })
        .subscribe((data: { id: string }[]) => {
          expect(data).toEqual(envelope.data);
        });

      const req = httpMock.expectOne('/api/orders');
      req.flush(envelope);
    });

    it('should issue POST request with body', () => {
      const payload = { customer: 'Alice', total: 100 };
      const response = { id: 'new-id', ...payload };

      service
        .post<{ id: string; customer: string; total: number }>('orders', payload)
        .subscribe((res: { id: string; customer: string; total: number }) => {
          expect(res).toEqual(response);
        });

      const req = httpMock.expectOne('/api/orders');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush(response);
    });

    it('should issue PUT request', () => {
      const payload = { status: 'shipped' };

      service.put('orders/1', payload).subscribe();

      const req = httpMock.expectOne('/api/orders/1');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(payload);
      req.flush({ success: true });
    });

    it('should issue DELETE request', () => {
      service.delete('orders/1').subscribe();

      const req = httpMock.expectOne('/api/orders/1');
      expect(req.request.method).toBe('DELETE');
      req.flush({ success: true });
    });

    it('should transform HttpErrorResponse into ApiError', () => {
      service.get('orders').subscribe({
        next: () => {
          throw new Error('Should not have succeeded');
        },
        error: (err: ApiError) => {
          expect(err).toBeInstanceOf(ApiError);
          expect(err.status).toBe(404);
          expect(err.message).toBe('Order not found');
          expect(err.isClientError).toBe(true);
        },
      });

      const req = httpMock.expectOne('/api/orders');
      req.flush({ message: 'Order not found' }, { status: 404, statusText: 'Not Found' });
    });
  });
});
