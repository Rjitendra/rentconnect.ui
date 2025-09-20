import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgreementModal } from './agreement-modal';

describe('AgreementModal', () => {
  let component: AgreementModal;
  let fixture: ComponentFixture<AgreementModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgreementModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgreementModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
