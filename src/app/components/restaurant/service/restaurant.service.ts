import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RestaurantService {
  constructor(private http: HttpClient) {}

  getRestaurants(lat: any, lng: any, countryCode: any, id: any) {
    return this.http.get(
      environment.HOST +
        `/api/MFoodz/GetAllShopsWithCategoriesByRadius?Lat=${lat}&Long=${lng}&CountryCode=${countryCode}&CustId=${id}&DeliveryType=1`
    );
  }
  getHeaderBanner(): Observable<any> {
    return this.http.get(
      `https://api.m-rides.com/api/MRide/GetCategoryWithIcons`
    );
  }

  getShopMenu(id: number) {
    return this.http.get(
      environment.HOST + `/api/MFoodz/GetShopMenu?ShopId=${id}`
    );
  }

  getShopSubmenu(menuId: number, subMenuId: any) {
    return this.http.get(
      environment.HOST +
        `/api/MFoodz/GetShopSubMenuWithSubheader?MenuId=${menuId}&SubMenuId=${subMenuId}`
    );
  }
}
