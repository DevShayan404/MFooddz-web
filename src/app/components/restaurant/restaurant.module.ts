import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { RestaurantRoutingModule } from './restaurant-routing.module';
import { RestaurantListComponent } from './restaurant-list/restaurant-list.component';
import { NgZorroModule } from '../../shared-modules/ng-zorro/ng-zorro.module';
import { RestaurantComponent } from './restaurant.component';
import { MenuComponent } from './menu/menu.component';

@NgModule({
  declarations: [RestaurantListComponent, RestaurantComponent, MenuComponent],
  imports: [CommonModule, RestaurantRoutingModule, NgZorroModule],
  providers: [DatePipe],
})
export class RestaurantModule {}
