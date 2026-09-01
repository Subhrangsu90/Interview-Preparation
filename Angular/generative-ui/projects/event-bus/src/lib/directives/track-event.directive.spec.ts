import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TrackEventDirective } from './track-event.directive';
import { EventBusService } from '../services/event-bus.service';

@Component({
  template: `
    <button id="test-btn" [trackEvent]="'TEST_BTN_CLICK'" [eventPayload]="{ orderId: 42 }">
      Click Me
    </button>
  `,
  imports: [TrackEventDirective],
})
class TestHostComponent {}

describe('TrackEventDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let eventBus: EventBusService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [EventBusService],
    });

    fixture = TestBed.createComponent(TestHostComponent);
    eventBus = TestBed.inject(EventBusService);
    fixture.detectChanges();
  });

  it('should emit event onto EventBusService when element is clicked', () => {
    const btn = fixture.debugElement.query(By.css('#test-btn'));
    btn.nativeElement.click();

    expect(eventBus.events().length).toBe(1);
    const event = eventBus.latestEvent();
    expect(event?.name).toBe('TEST_BTN_CLICK');
    expect(event?.source).toBe('component');
    expect(event?.payload).toEqual({ orderId: 42 });
    expect(event?.metadata?.['element']).toBe('button');
  });
});
