import { Component } from '@angular/core';
import { OwlOptions } from 'ngx-owl-carousel-o';

@Component({
  selector: 'app-skeleton-header',
  templateUrl: './skeleton-header.component.html',
  styleUrl: './skeleton-header.component.css',
})
export class SkeletonHeaderComponent {
  customOptions: OwlOptions = {
    loop: false,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: false,
    dots: false,
    navSpeed: 700,

    navText: [
      '<i class="bi bi-chevron-left"></i>',
      '<i class="bi bi-chevron-right"></i>',
    ],
    margin: 20,
    // stagePadding: 5,
    responsive: {
      0: {
        items: 1,
      },
      400: {
        items: 2,
      },
      740: {
        items: 6,
      },
      940: {
        items: 8,
      },
    },
    nav: false,
  };
  customOptionsHeader: OwlOptions = {
    loop: false,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: false,
    dots: false,
    navSpeed: 700,

    navText: [
      '<i class="bi bi-chevron-left"></i>',
      '<i class="bi bi-chevron-right"></i>',
    ],
    margin: 20,
    // stagePadding: 5,
    responsive: {
      0: {
        items: 1,
      },
      400: {
        items: 2,
      },
      740: {
        items: 8,
      },
      940: {
        items: 10,
      },
    },
    nav: false,
  };
  headerList: any[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
}
