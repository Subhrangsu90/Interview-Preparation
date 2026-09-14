import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SignalStateDemo } from './signal-state-demo';

describe('SignalStateDemo', () => {
  let component: SignalStateDemo;
  let fixture: ComponentFixture<SignalStateDemo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignalStateDemo],
    }).compileComponents();

    fixture = TestBed.createComponent(SignalStateDemo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
