import { Component } from '@angular/core';
interface Moment {
  id: number;
  imageUrl: string;
  caption: string;
}
@Component({
  selector: 'ng-moments',
  imports: [],
  templateUrl: './moments.component.html',
  styleUrl: './moments.component.scss',
})
export class MomentsComponent {
  moments: Moment[] = [
    { id: 1, imageUrl: 'moments/1.png', caption: 'College Days' },
    { id: 2, imageUrl: 'moments/2.png', caption: 'College Days' },
    { id: 3, imageUrl: 'moments/3.png', caption: 'College Days' },
    { id: 4, imageUrl: 'moments/4.png', caption: 'In office with my seniors' },
    { id: 5, imageUrl: 'moments/5.png', caption: 'Holi' },
    { id: 6, imageUrl: 'moments/6.png', caption: 'my seniors' },
    { id: 7, imageUrl: 'moments/7.png', caption: 'All legends in one frame' },
    { id: 8, imageUrl: 'moments/8.png', caption: 'Myself' },
  ];
}
