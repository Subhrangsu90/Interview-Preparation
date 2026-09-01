/*
 * Public API Surface of shared-ui
 * Following Angular Package Format (APF) guidelines
 */

// Components
export * from './lib/components/page-header/page-header.component';
export * from './lib/components/metric-card/metric-card.component';
export * from './lib/components/status-badge/status-badge.component';
export * from './lib/components/search-input/search-input.component';
export * from './lib/components/empty-state/empty-state.component';
export * from './lib/components/confirm-dialog/confirm-dialog.component';
export * from './lib/components/confirm-dialog/confirm-dialog.service';
export * from './lib/components/loading-spinner/loading-spinner.component';
export * from './lib/components/pagination/pagination.component';
export * from './lib/services/loading.service';

// Directives
export * from './lib/directives/copy-to-clipboard.directive';

// Pipes
export * from './lib/pipes/relative-time.pipe';
export * from './lib/pipes/currency-format.pipe';
export * from './lib/pipes/paginate.pipe';
