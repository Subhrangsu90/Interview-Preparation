import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SignalStore } from './signal-store';

describe('SignalStore', () => {
  let component: SignalStore;
  let fixture: ComponentFixture<SignalStore>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignalStore],
    }).compileComponents();

    fixture = TestBed.createComponent(SignalStore);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
