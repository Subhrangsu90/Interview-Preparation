import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SignalState } from './signal-state';

describe('SignalState', () => {
  let component: SignalState;
  let fixture: ComponentFixture<SignalState>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignalState],
    }).compileComponents();

    fixture = TestBed.createComponent(SignalState);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
