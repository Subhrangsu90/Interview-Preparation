import { describe, it, expect, beforeEach } from 'vitest';
import { UiLoadingService } from './loading.service';

describe('UiLoadingService', () => {
  let service: UiLoadingService;

  beforeEach(() => {
    service = new UiLoadingService();
  });

  it('should start not loading', () => {
    expect(service.isLoading()).toBe(false);
  });

  it('should be loading after show()', () => {
    service.show();
    expect(service.isLoading()).toBe(true);
  });

  it('should stop loading after hide()', () => {
    service.show();
    service.hide();
    expect(service.isLoading()).toBe(false);
  });

  it('should handle multiple requests correctly', () => {
    service.show();
    service.show();
    expect(service.isLoading()).toBe(true);
    service.hide();
    expect(service.isLoading()).toBe(true);
    service.hide();
    expect(service.isLoading()).toBe(false);
  });

  it('should reset to not loading', () => {
    service.show();
    service.show();
    service.reset();
    expect(service.isLoading()).toBe(false);
  });
});
