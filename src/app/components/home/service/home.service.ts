import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HomeService {
  constructor(private http: HttpClient) {}

  getSavedLocation(country: string): Observable<any> {
    return this.http.get(
      environment.HOST +
        `/api/MRide/SearchLocation?SearchValue=${{}}&CountryCode=${country}`
    );
  }
  getCurrentLocation(latlng: any): Observable<any> {
    return this.http.get(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latlng}&key=AIzaSyBoggmNYAGO4585YCVDhYsQOrr_YLl_pYs`
    );
  }
}
