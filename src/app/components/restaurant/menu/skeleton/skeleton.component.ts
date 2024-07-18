import { Component } from '@angular/core';
import {
  NzSkeletonAvatarShape,
  NzSkeletonAvatarSize,
  NzSkeletonButtonShape,
  NzSkeletonButtonSize,
  NzSkeletonInputSize,
} from 'ng-zorro-antd/skeleton';
import { OwlOptions } from 'ngx-owl-carousel-o';

@Component({
  selector: 'app-skeleton',
  templateUrl: './skeleton.component.html',
  styleUrl: './skeleton.component.css',
})
export class SkeletonComponent {
  customOptionsMenuLinks: OwlOptions = {
    loop: false,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: false,
    navSpeed: 700,
    navText: [
      '<i class="bi bi-chevron-left"></i>',
      '<i class="bi bi-chevron-right"></i>',
    ],
    margin: 20,
    responsive: {
      0: {
        items: 1,
      },
      400: {
        items: 2,
      },
      740: {
        items: 3,
      },
      940: {
        items: 8,
      },
    },
    nav: true,
  };
  restaurantMenu: any[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];
}
