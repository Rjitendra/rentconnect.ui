import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OngoingTenancy } from './ongoing-tenancy';

describe('OngoingTenancy', () => {
  let component: OngoingTenancy;
  let fixture: ComponentFixture<OngoingTenancy>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OngoingTenancy]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OngoingTenancy);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
