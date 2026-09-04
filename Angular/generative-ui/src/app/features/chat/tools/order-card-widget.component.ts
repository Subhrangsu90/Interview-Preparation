import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { type AngularToolCall, type ToolRenderer } from '@copilotkit/angular';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { UiStatusBadge } from '@shared/ui/components/status-badge';

export interface OrderWidgetArgs {
  orderNumber: string;
  status: 'pending' | 'processing' | 'in_transit' | 'delivered';
  eta: string;
  [key: string]: unknown;
}

@Component({
  selector: 'app-order-card-widget',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, UiStatusBadge],
  template: `
    @let args = toolCall().args;
    @if (args) {
      <mat-card appearance="outlined" class="order-widget-card" style="margin: 8px 0; padding: 16px; border-radius: 12px; border: 1px solid var(--mat-sys-outline-variant);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-weight: 600; font-size: 1rem;">📦 Order {{ args.orderNumber }}</span>
          <ui-status-badge [status]="args.status || 'pending'" />
        </div>
        <div style="color: var(--mat-sys-on-surface-variant); font-size: 0.9rem;">
          Estimated Delivery: <strong>{{ args.eta }}</strong>
        </div>
      </mat-card>
    }
  `,
})
export class OrderCardWidgetComponent implements ToolRenderer<OrderWidgetArgs> {
  // Required input by ToolRenderer
  readonly toolCall = input.required<AngularToolCall<OrderWidgetArgs>>();
}
