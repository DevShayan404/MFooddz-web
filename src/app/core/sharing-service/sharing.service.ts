import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SharingService {
  private isVisible = new BehaviorSubject<boolean>(true);
  private isVisibleFooter = new BehaviorSubject<boolean>(true);
  private country = new BehaviorSubject<string>('CA');
  private city = new BehaviorSubject<string>('');
  private restaurantList = new BehaviorSubject<any[]>([]);

  constructor() {}
  showNavbar(data: boolean) {
    this.isVisible.next(data);
  }
  getNavbarVisibility() {
    return this.isVisible.asObservable();
  }

  showFooter(data: boolean) {
    this.isVisibleFooter.next(data);
  }
  getFooterVisibility() {
    return this.isVisibleFooter.asObservable();
  }

  setCountry(code: string) {
    this.country.next(code);
  }
  getCountry() {
    return this.country.asObservable();
  }
  // -----------Restaurant Module-----------
  setCity(data: any) {
    this.city.next(data);
  }
  getCity() {
    return this.city.asObservable();
  }

  setRestauranList(data: any) {
    this.restaurantList.next(data);
  }
  getRestauranList() {
    return this.restaurantList.asObservable();
  }

}
