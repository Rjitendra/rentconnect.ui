import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgAdvancedCard } from './ng-advanced-card';

describe('NgAdvancedCard', () => {
  let component: NgAdvancedCard;
  let fixture: ComponentFixture<NgAdvancedCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgAdvancedCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NgAdvancedCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
