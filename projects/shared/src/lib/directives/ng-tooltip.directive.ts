import { Directive, Input } from '@angular/core';
import { MatTooltip } from '@angular/material/tooltip';

@Directive({
  selector: '[ngTooltip]',
  standalone: true,
  hostDirectives: [
    {
      directive: MatTooltip,
      inputs: [
        'matTooltip: ngTooltip',
        'matTooltipPosition',
        'matTooltipDisabled',
        'matTooltipShowDelay',
        'matTooltipHideDelay',
        'matTooltipClass',
      ],
    },
  ],
})
export class NgTooltipDirective {
  @Input() ngTooltip: string = '';
}
