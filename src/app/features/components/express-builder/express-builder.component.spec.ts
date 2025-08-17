import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpressBuilderComponent } from './express-builder.component';

describe('ExpressBuilderComponent', () => {
  let component: ExpressBuilderComponent;
  let fixture: ComponentFixture<ExpressBuilderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpressBuilderComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ExpressBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
