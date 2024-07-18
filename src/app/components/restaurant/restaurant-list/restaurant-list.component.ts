import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HomeService } from '../../home/service/home.service';
import { SharingService } from '../../../core/sharing-service/sharing.service';
import { RestaurantService } from '../service/restaurant.service';

@Component({
  selector: 'app-restaurant-list',
  templateUrl: './restaurant-list.component.html',
  styleUrl: './restaurant-list.component.css',
})
export class RestaurantListComponent {
  restaurantList!: any[];
  cityName!: any;

  constructor(
    private router: Router,
    private sharingService: SharingService,
    private activatedRoute: ActivatedRoute,
    private service: RestaurantService
  ) {}
  loading: boolean = false;
  ngOnInit(): void {
    this.loading = true;
    this.activatedRoute.queryParams.subscribe((params) => {
      const lat = params['lat'];
      const lng = params['lng'];
      const countryCode = params['countryCode'];
      const custId = localStorage.getItem('custId');

      this.service.getRestaurants(lat, lng, countryCode, custId).subscribe({
        next: (res: any) => {
          this.restaurantList = JSON.parse(
            res?.Result?.Data
          ).Shops[0].AllRestaurants;
          // this.sharingService.setRestauranList(this.restaurantList);
          this.loading = false;
        },
      });
      this.sharingService.getCity().subscribe({
        next: (res) => {
          this.cityName = res;
        },
      });
    });
  }

  routeToMenu(id: number) {
    const checkMenuId = JSON.parse(localStorage.getItem('restaurantList')!);
    if (checkMenuId) {
      const isExistMenuId = checkMenuId.find((x: any) => x.Id === id);
      if (!isExistMenuId) {
        localStorage.removeItem('cartList');
      }
    }
    const currentQueryParams = this.activatedRoute.snapshot.queryParams;
    const newQueryParams = { ...currentQueryParams, menuId: id };
    this.router.navigate(['restaurant/menu'], {
      queryParams: newQueryParams,
    });
  }
}
