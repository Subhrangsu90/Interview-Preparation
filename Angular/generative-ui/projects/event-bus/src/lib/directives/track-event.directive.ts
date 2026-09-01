import { Directive, ElementRef, HostListener, inject, input } from '@angular/core';
import { EventBusService } from '../services/event-bus.service';
import { UiEventCategory } from '../models/event.models';
import { TelemetryEventName } from '../models/event-names.constants';

/**
 * Declarative directive to track UI events directly from HTML templates.
 *
 * Example:
 * ```html
 * <button [trackEvent]="'ORDER_FILTER_CLICK'" [eventPayload]="{ status: 'shipped' }">
 *   Shipped
 * </button>
 * ```
 */
@Directive({
  selector: '[trackEvent]',
  standalone: true,
})
export class TrackEventDirective {
  private readonly eventBus = inject(EventBusService);
  private readonly el = inject(ElementRef<HTMLElement>);

  readonly trackEvent = input.required<TelemetryEventName>();
  readonly eventPayload = input<unknown>(undefined);
  readonly eventCategory = input<UiEventCategory>('action');
  readonly eventTrigger = input<'click' | 'focus' | 'blur' | 'change'>('click');

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    if (this.eventTrigger() === 'click') {
      this.dispatch('click', event);
    }
  }

  @HostListener('focus', ['$event'])
  onFocus(event: FocusEvent): void {
    if (this.eventTrigger() === 'focus') {
      this.dispatch('focus', event);
    }
  }

  @HostListener('blur', ['$event'])
  onBlur(event: FocusEvent): void {
    if (this.eventTrigger() === 'blur') {
      this.dispatch('blur', event);
    }
  }

  @HostListener('change', ['$event'])
  onChange(event: Event): void {
    if (this.eventTrigger() === 'change') {
      this.dispatch('change', event);
    }
  }

  private dispatch(trigger: string, originalEvent: Event): void {
    const tagName = this.el.nativeElement.tagName.toLowerCase();
    const id = this.el.nativeElement.id || undefined;
    const className = this.el.nativeElement.className || undefined;

    this.eventBus.emit({
      source: 'component',
      category: this.eventCategory(),
      name: this.trackEvent(),
      payload: this.eventPayload() !== undefined ? this.eventPayload() : { trigger },
      metadata: {
        element: tagName,
        elementId: id,
        elementClass: className,
        altKey: (originalEvent as MouseEvent).altKey,
        shiftKey: (originalEvent as MouseEvent).shiftKey,
      },
    });
  }
}
