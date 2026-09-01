import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UiPagination } from './pagination.component';
import { PageEvent } from '@angular/material/paginator';

describe('UiPagination', () => {
  let component: UiPagination;
  let fixture: ComponentFixture<UiPagination>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiPagination],
    }).compileComponents();

    fixture = TestBed.createComponent(UiPagination);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update pageIndex and pageSize and emit pageChange on page event', () => {
    const emitted: PageEvent[] = [];
    component.pageChange.subscribe((event) => emitted.push(event));

    const testEvent: PageEvent = {
      pageIndex: 2,
      pageSize: 25,
      length: 100,
    };

    component.onPage(testEvent);

    expect(component.pageIndex()).toBe(2);
    expect(component.pageSize()).toBe(25);
    expect(emitted.length).toBe(1);
    expect(emitted[0]).toEqual(testEvent);
  });
});
