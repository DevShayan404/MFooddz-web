import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CheckoutService {
  headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
  custId: number = parseFloat(localStorage.getItem('custId')!);
  encodeFormData(data: any) {
    return Object.keys(data)
      .map(
        (key) => encodeURIComponent(key) + '=' + encodeURIComponent(data[key])
      )
      .join('&');
  }

  constructor(private http: HttpClient) {}

  getCountries() {
    return this.http.get('https://countriesnow.space/api/v0.1/countries');
  }

  postCardForm(data: any) {
    const body = this.encodeFormData(data);
    return this.http.post(
      'https://api.m-rides.com/api/MRide/SaveCardInfoOfCustomer',
      body,
      {
        headers: this.headers,
        responseType: 'json',
      }
    );
  }

  getSavedCard() {
    const custId = parseFloat(localStorage.getItem('custId')!);
    return this.http.get(
      `https://api.m-rides.com/api/MRide/GetCardInfoOfCustomer?CustomerId=${custId}`
    );
  }

  getDropType() {
    return this.http.get('https://api.m-rides.com/api/MFoodz/OrderHandToType');
  }

  getSavedLocations(): Observable<any> {
    return this.http.get(
      `https://api.m-rides.com/api/MRide/GetSavedAndRecentLocationsForCustomer?CustomerId=${this.custId}`
    );
  }
  postAddress(data: any): Observable<any> {
    const body = this.encodeFormData(data);
    return this.http.post(
      'https://api.m-rides.com/api/MRide/SaveLocationForCustomer',
      body,
      {
        headers: this.headers,
        responseType: 'json',
      }
    );
  }

  getPromoCode(rideType: number, promoCode: string): Observable<any> {
    return this.http.get(
      `https://api.m-rides.com/api/MRide/CouponValidation?CustomerId=${this.custId}&rideTypeId=${rideType}&CouponNumber=${promoCode}`
    );
  }
}
