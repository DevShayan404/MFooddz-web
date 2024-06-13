import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  constructor(private http: HttpClient) {}

  getCountryList(): Observable<any> {
    return this.http.get(environment.HOST + '/api/MRide/GetCountries');
  }

  postLogin(data: {}): Observable<any> {
    // console.log('api', data);
    const params = new HttpParams({ fromObject: data });
    return this.http.post(
      environment.HOST + '/api/MRide/OTPVerificationOfCustomer',
      params
    );
  }

  postCustomerName(data: any): Observable<any> {
    const params = new HttpParams({ fromObject: data });
    return this.http.post(
      environment.HOST + '/api/MRide/CustomerSignup',
      params
    );
  }
}
