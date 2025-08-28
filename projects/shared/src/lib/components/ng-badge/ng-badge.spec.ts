import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgBadge } from './ng-badge';

describe('NgBadge', () => {
  let component: NgBadge;
  let fixture: ComponentFixture<NgBadge>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgBadge]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NgBadge);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
