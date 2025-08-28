import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';

// Import other shared library components
import { NgButton } from '../ng-button/ng-button';
import { NgCardComponent } from '../ng-card/ng-card.component';
import { NgDivider } from '../ng-divider/ng-divider';
import { NgIconComponent } from '../ng-icon/ng-icon';

export interface NgAdvancedCardAction {
  label: string;
  icon?: string;
  type?: 'primary' | 'secondary' | 'danger';
  action: string;
}

@Component({
  selector: 'ng-advanced-card',
  standalone: true,
  imports: [
    CommonModule,
    NgCardComponent, // Using ng-card inside this component
    NgButton, // Using ng-button inside this component
    NgIconComponent, // Using ng-icon inside this component
    NgDivider, // Using ng-divider inside this component
  ],
  template: `
    <ng-card
      [title]="title()"
      [subtitle]="subtitle()"
      [icon]="headerIcon()"
      [appearance]="appearance()"
    >
      <!-- Main Content -->
      <div class="card-content">
        <ng-content></ng-content>
      </div>

      <!-- Actions Section -->
      @if (actions().length > 0) {
        <ng-divider />
        <div class="card-actions">
          @for (action of actions(); track action.action) {
            <ng-button
              buttonType="button"
              [type]="getButtonType(action.type)"
              [label]="action.label"
              [icon]="action.icon"
              (buttonClick)="onActionClick(action)"
            />
          }
        </div>
      }

      <!-- Footer Section -->
      @if (showFooter()) {
        <ng-divider />
        <div class="card-footer">
          @if (footerIcon()) {
            <ng-icon [name]="footerIcon()!" class="footer-icon" />
          }
          <span class="footer-text">{{ footerText() }}</span>

          @if (showTimestamp()) {
            <span class="timestamp">{{ timestamp() | date: 'short' }}</span>
          }
        </div>
      }
    </ng-card>
  `,
  styles: [
    `
      .card-content {
        margin-bottom: 16px;
      }

      .card-actions {
        display: flex;
        gap: 8px;
        padding: 16px 0 8px 0;
        justify-content: flex-end;
      }

      .card-footer {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 0;
        color: #666;
        font-size: 0.875rem;
      }

      .footer-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }

      .footer-text {
        flex: 1;
      }

      .timestamp {
        font-size: 0.75rem;
        color: #999;
      }
    `,
  ],
})
export class NgAdvancedCard {
  // Card properties
  readonly title = input<string>();
  readonly subtitle = input<string>();
  readonly headerIcon = input<string>();
  readonly appearance = input<'raised' | 'outlined'>('raised');

  // Actions
  readonly actions = input<NgAdvancedCardAction[]>([]);
  readonly actionClick = output<NgAdvancedCardAction>();

  // Footer
  readonly showFooter = input<boolean>(false);
  readonly footerIcon = input<string>();
  readonly footerText = input<string>();
  readonly showTimestamp = input<boolean>(false);
  readonly timestamp = input<Date>();

  onActionClick(action: NgAdvancedCardAction): void {
    this.actionClick.emit(action);
  }

  getButtonType(actionType?: string): string {
    switch (actionType) {
      case 'primary':
        return 'filled';
      case 'secondary':
        return 'outlined';
      case 'danger':
        return 'text';
      default:
        return 'text';
    }
  }
}
