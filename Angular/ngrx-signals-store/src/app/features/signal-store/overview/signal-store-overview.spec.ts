import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SignalStoreOverview } from './signal-store-overview';

describe('SignalStoreOverview', () => {
  let component: SignalStoreOverview;
  let fixture: ComponentFixture<SignalStoreOverview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignalStoreOverview],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(SignalStoreOverview);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
