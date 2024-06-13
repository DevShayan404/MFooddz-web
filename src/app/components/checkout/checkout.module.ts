import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CheckoutRoutingModule } from './checkout-routing.module';
import { PlaceOrderComponent } from './place-order/place-order.component';
import { NgZorroModule } from '../../shared-modules/ng-zorro/ng-zorro.module';
import { GoogleMapComponent } from './google-map/google-map.component';


@NgModule({
  declarations: [
    PlaceOrderComponent,
    GoogleMapComponent
  ],
  imports: [
    CommonModule,
    CheckoutRoutingModule,
    NgZorroModule
  ]
})
export class CheckoutModule { }
