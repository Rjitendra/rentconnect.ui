import { Component } from '@angular/core';

import { NAVITEMS } from '../app.nav';
import { LibLayoutComponent, NgAlertComponent } from '../../../projects/shared/src/public-api';

@Component({
  selector: 'ng-layout',
  imports: [LibLayoutComponent, NgAlertComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
})
export class LayoutComponent {
  navItes = NAVITEMS;
}
