import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-topic-placeholder',
  imports: [MatIcon, MatButton],
  templateUrl: './topic-placeholder.html',
  styleUrl: './topic-placeholder.scss',
})
export class TopicPlaceholder {
  private readonly route = inject(ActivatedRoute);

  readonly title = () => this.route.snapshot.data['title'] ?? 'Topic Guide';
  readonly summary = () => this.route.snapshot.data['summary'] ?? '';
  readonly status = () => this.route.snapshot.data['status'] ?? 'Upcoming';
  readonly codeSnippet = () => this.route.snapshot.data['codeSnippet'] ?? '';
  readonly docsUrl = () => this.route.snapshot.data['docsUrl'] ?? 'https://ngrx.io/guide/signals/signal-store';

  get statusClass(): string {
    const s = this.status();
    if (s === 'Next Up' || s === 'Next') return 'status-next';
    if (s === 'Done' || s === 'Completed') return 'status-done';
    return 'status-soon';
  }

  get fileName(): string {
    const t = this.title().toLowerCase().replace(/\s+/g, '-');
    if (t.includes('lifecycle')) return 'counter-store.ts';
    if (t.includes('custom-prop')) return 'books-store.ts';
    if (t.includes('entity')) return 'products-store.ts';
    return `${t}.ts`;
  }
}
