import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TenantPortal } from './tenant-portal';

describe('TenantPortal', () => {
  let component: TenantPortal;
  let fixture: ComponentFixture<TenantPortal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TenantPortal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TenantPortal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
