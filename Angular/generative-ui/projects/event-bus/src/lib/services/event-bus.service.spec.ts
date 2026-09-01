import { firstValueFrom } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { EventBusService } from './event-bus.service';

describe('EventBusService', () => {
  let service: EventBusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EventBusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
    expect(service.events().length).toBe(0);
  });

  it('should emit and store events in the ring buffer', () => {
    const ev = service.emit({
      source: 'component',
      category: 'action',
      name: 'TEST_CLICK',
      payload: { buttonId: 'submit-btn' },
    });

    expect(ev.id).toBeDefined();
    expect(ev.name).toBe('TEST_CLICK');
    expect(service.events().length).toBe(1);
    expect(service.latestEvent()?.name).toBe('TEST_CLICK');
    expect(service.countsBySource().component).toBe(1);
  });

  it('should notify observable subscribers on emit', async () => {
    const promise = firstValueFrom(service.events$);

    service.emit({
      source: 'service',
      category: 'data',
      name: 'ASYNC_EVENT',
    });

    const event = await promise;
    expect(event.name).toBe('ASYNC_EVENT');
  });

  it('should filter events accurately by source and search query', () => {
    service.emit({
      source: 'component',
      category: 'action',
      name: 'BTN_CLICK',
      payload: { query: 'alpha' },
    });
    service.emit({
      source: 'http',
      category: 'data',
      name: 'API_GET_ORDERS',
      payload: { total: 10 },
    });

    expect(service.filteredEvents().length).toBe(2);

    // Filter by source
    service.setFilter({ source: 'http' });
    expect(service.filteredEvents().length).toBe(1);
    expect(service.filteredEvents()[0].name).toBe('API_GET_ORDERS');

    // Filter by search
    service.setFilter({ source: 'all', search: 'alpha' });
    expect(service.filteredEvents().length).toBe(1);
    expect(service.filteredEvents()[0].name).toBe('BTN_CLICK');
  });

  it('should pause and resume event capturing', () => {
    service.pause();
    expect(service.isPaused()).toBe(true);

    service.emit({
      source: 'pipe',
      category: 'data',
      name: 'IGNORED_EVENT',
    });

    expect(service.events().length).toBe(0);

    service.resume();
    service.emit({
      source: 'pipe',
      category: 'data',
      name: 'CAPTURED_EVENT',
    });

    expect(service.events().length).toBe(1);
  });

  it('should clear all events when clear() is invoked', () => {
    service.emit({ source: 'component', category: 'action', name: 'EV1' });
    service.emit({ source: 'service', category: 'data', name: 'EV2' });
    expect(service.events().length).toBe(2);

    service.clear();
    expect(service.events().length).toBe(0);
    expect(service.latestEvent()).toBeNull();
  });
});
