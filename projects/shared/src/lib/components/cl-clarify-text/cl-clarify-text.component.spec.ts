import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClClarifyTextComponent } from './cl-clarify-text.component';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

describe('ClClarifyTextComponent', () => {
  let component: ClClarifyTextComponent;
  let fixture: ComponentFixture<ClClarifyTextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClClarifyTextComponent, MatIconModule, MatTooltipModule]
    }).compileComponents();

    fixture = TestBed.createComponent(ClClarifyTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display help_outline icon', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const iconElement = compiled.querySelector('mat-icon');
    expect(iconElement?.textContent?.trim()).toBe('help_outline');
  });

  it('should apply disabled class when isIconDisabled is true', () => {
    component.isIconDisabled = true;
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement as HTMLElement;
    const iconElement = compiled.querySelector('mat-icon');
    expect(iconElement?.classList).toContain('disabled');
  });

  it('should not apply disabled class when isIconDisabled is false', () => {
    component.isIconDisabled = false;
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement as HTMLElement;
    const iconElement = compiled.querySelector('mat-icon');
    expect(iconElement?.classList).not.toContain('disabled');
  });

  it('should set matTooltip with clarifyText', () => {
    component.clarifyText = 'This is clarification text';
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement as HTMLElement;
    const iconElement = compiled.querySelector('mat-icon');
    expect(iconElement?.getAttribute('ng-reflect-message')).toBe('This is clarification text');
  });
});