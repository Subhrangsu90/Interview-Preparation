import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UiEventMonitorComponent } from './event-monitor.component';
import { EventBusService } from '../../services/event-bus.service';

describe('UiEventMonitorComponent', () => {
  let component: UiEventMonitorComponent;
  let fixture: ComponentFixture<UiEventMonitorComponent>;
  let eventBus: EventBusService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiEventMonitorComponent],
      providers: [EventBusService],
    }).compileComponents();

    fixture = TestBed.createComponent(UiEventMonitorComponent);
    component = fixture.componentInstance;
    eventBus = TestBed.inject(EventBusService);
    fixture.detectChanges();
  });

  it('should create the event monitor component', () => {
    expect(component).toBeTruthy();
    expect(component.isExpanded()).toBe(false);
  });

  it('should toggle expand and minimize state', () => {
    component.toggleExpand();
    expect(component.isExpanded()).toBe(true);

    component.toggleExpand();
    expect(component.isExpanded()).toBe(false);
  });

  it('should filter events when a source is selected', () => {
    eventBus.emit({ source: 'component', category: 'action', name: 'CLICK_1' });
    eventBus.emit({ source: 'http', category: 'data', name: 'HTTP_1' });

    expect(component.events().length).toBe(2);

    component.selectSource('http');
    expect(component.selectedSource()).toBe('http');
    expect(component.events().length).toBe(1);
    expect(component.events()[0].name).toBe('HTTP_1');
  });

  it('should clear events when clearEvents() is called', () => {
    eventBus.emit({ source: 'component', category: 'action', name: 'CLICK_1' });
    expect(component.events().length).toBe(1);

    component.clearEvents();
    expect(component.events().length).toBe(0);
    expect(component.selectedEvent()).toBeNull();
  });
});
