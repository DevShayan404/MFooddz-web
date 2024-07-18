import { Component } from '@angular/core';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { ActivatedRoute, Router } from '@angular/router';
import { SharingService } from '../../core/sharing-service/sharing.service';
import { RestaurantService } from './service/restaurant.service';
import { HomeService } from '../home/service/home.service';

@Component({
  selector: 'app-restaurant',
  templateUrl: './restaurant.component.html',
  styleUrl: './restaurant.component.css',
})
export class RestaurantComponent {
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
  constructor(
    private sharingService: SharingService,
    private service: RestaurantService,
    private activatedRoute: ActivatedRoute,
    private homeSerive: HomeService
  ) {}

  headerList!: any;
  bannerList!: any;
  cityName!: string;
  loading: boolean = false;
  ngOnInit(): void {
    this.loading = true;
    this.sharingService.showFooter(false);
    this.sharingService.showNavbar(true);
    this.activatedRoute.queryParams.subscribe((params) => {
      const lat = params['lat'];
      const lng = params['lng'];
      const countryCode = params['countryCode'];
      const custId = localStorage.getItem('custId');

      this.service.getHeaderBanner().subscribe({
        next: (res: any) => {
          const header = [JSON.parse(res?.Result?.Data)?.Banners];
          this.headerList = header[0]?.Banner;
          const banner = [JSON.parse(res?.Result?.Data)?.Categories];
          this.bannerList = banner[0]?.Category;
          this.loading = false;
        },
      });

      this.service.getRestaurants(lat, lng, countryCode, custId).subscribe({
        next: (res: any) => {
          const restaurantList = JSON.parse(res?.Result?.Data).Shops[0]
            .AllRestaurants;
          this.sharingService.setRestauranList(restaurantList);
          // console.log(restaurantList);
        },
      });

      this.getCityName(lat, lng);
    });
  }

  getCityName(lat: number, lng: number) {
    const latlng = `${lat},${lng}`;
    this.homeSerive.getCurrentLocation(latlng).subscribe({
      next: (res) => {
        const results = res.results;
        if (results.length > 0) {
          const addressComponents = results[0].address_components;
          for (let component of addressComponents) {
            if (component.types.includes('locality')) {
              this.sharingService.setCity(component.long_name);
              this.cityName = component.long_name;
              localStorage.setItem('city', this.cityName);
              break;
            }
          }
        }
      },
    });
  }
}
