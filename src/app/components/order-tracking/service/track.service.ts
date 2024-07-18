import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TrackService {
  private history: string[] = [];
  private custId: number = parseFloat(localStorage.getItem('custId')!);
  constructor(private http: HttpClient, private router: Router) {
    router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.history.push(event.urlAfterRedirects);
      }
    });
  }
  getHistory(): string[] {
    return this.history;
  }

  clearHistory() {
    this.history = [];
  }

  getOrderHistory(): Observable<any> {
    return this.http.get(
      `https://api.m-rides.com/api/MFoodz/GetOrderHistoryForCustNew?CustId=${this.custId}&Category=1`
    );
  }
}
