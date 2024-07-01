import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CheckoutService {
  constructor(private http: HttpClient) {}

  getCountries() {
    return this.http.get('https://countriesnow.space/api/v0.1/countries');
  }
}
