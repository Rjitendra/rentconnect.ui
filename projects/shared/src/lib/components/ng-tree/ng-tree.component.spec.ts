import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgTreeComponent } from './ng-tree.component';

describe('NgTreeComponent', () => {
  let component: NgTreeComponent;
  let fixture: ComponentFixture<NgTreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgTreeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NgTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
