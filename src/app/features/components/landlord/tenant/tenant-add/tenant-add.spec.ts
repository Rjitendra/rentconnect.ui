import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TenantAdd } from './tenant-add';

describe('TenantAdd', () => {
  let component: TenantAdd;
  let fixture: ComponentFixture<TenantAdd>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TenantAdd]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TenantAdd);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
