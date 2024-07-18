import { Component } from '@angular/core';

@Component({
  selector: 'app-skeleton-restaurant',
  templateUrl: './skeleton-restaurant.component.html',
  styleUrl: './skeleton-restaurant.component.css',
})
export class SkeletonRestaurantComponent {
  restaurantList: any[] = [1, 2, 3, 4, 5, 6, 7, 8];
}
