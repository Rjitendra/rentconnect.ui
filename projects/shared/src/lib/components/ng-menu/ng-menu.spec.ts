import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgMenu } from './ng-menu';

describe('NgMenu', () => {
  let component: NgMenu;
  let fixture: ComponentFixture<NgMenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgMenu]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NgMenu);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
