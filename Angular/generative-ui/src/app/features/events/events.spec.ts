import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { EventsComponent } from './events';
import { EventBusService } from '@event-bus/services';

describe('EventsComponent', () => {
  let component: EventsComponent;
  let fixture: ComponentFixture<EventsComponent>;
  let eventBus: EventBusService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventsComponent],
      providers: [provideRouter([]), EventBusService],
    }).compileComponents();

    fixture = TestBed.createComponent(EventsComponent);
    component = fixture.componentInstance;
    eventBus = TestBed.inject(EventBusService);
    fixture.detectChanges();
  });

  it('should create the events component', () => {
    expect(component).toBeTruthy();
  });

  it('should filter events when a source tab is clicked', () => {
    eventBus.emit({ source: 'component', category: 'action', name: 'CLICK_EVENT' });
    eventBus.emit({ source: 'http', category: 'data', name: 'HTTP_REQUEST' });

    expect(component.events().length).toBe(2);

    component.selectSource('http');
    expect(component.selectedSource()).toBe('http');
    expect(component.events().length).toBe(1);
    expect(component.events()[0].name).toBe('HTTP_REQUEST');
  });

  it('should select and deselect an event for payload inspection', () => {
    const ev = eventBus.emit({
      source: 'service',
      category: 'data',
      name: 'DATA_UPDATE',
      payload: { count: 12 },
    });

    component.selectEvent(ev);
    expect(component.selectedEvent()?.id).toBe(ev.id);

    // Toggle off
    component.selectEvent(ev);
    expect(component.selectedEvent()).toBeNull();
  });

  it('should clear events when clearEvents() is called', () => {
    eventBus.emit({ source: 'component', category: 'action', name: 'CLICK_EVENT' });
    expect(component.events().length).toBe(1);

    component.clearEvents();
    expect(component.events().length).toBe(0);
    expect(component.selectedEvent()).toBeNull();
  });
});
