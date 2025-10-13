import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentDownload } from './document-download';

describe('DocumentDownload', () => {
  let component: DocumentDownload;
  let fixture: ComponentFixture<DocumentDownload>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentDownload]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentDownload);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
