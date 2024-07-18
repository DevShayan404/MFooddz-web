import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HomeService {
  APIKey = 'AIzaSyBJR3QOIWeXI55zqmcQ0bPZ_8Dml3CmcMs';
  constructor(private http: HttpClient) {}

  getSavedLocation(country: string): Observable<any> {
    return this.http.get(
      environment.HOST +
        `/api/MRide/SearchLocation?SearchValue=${{}}&CountryCode=${country}`
    );
  }
  getCurrentLocation(latlng: any): Observable<any> {
    return this.http.get(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latlng}&key=${this.APIKey}`
    );
  }

  getAddress(latitude: number, longitude: number) {
    return this.http.get(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
    );
  }

  getRestaurants(countryCode: number) {
    return this.http.get(
      `https://api.m-rides.com/api/MRide/GetResturant?Country=${countryCode}`
    );
  }
}
