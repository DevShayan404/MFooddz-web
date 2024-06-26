import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CheckoutRoutingModule } from './checkout-routing.module';
import { PlaceOrderComponent } from './place-order/place-order.component';
import { NgZorroModule } from '../../shared-modules/ng-zorro/ng-zorro.module';
import { GoogleMapComponent } from './google-map/google-map.component';
import { PaymentModalComponent } from './modal/payment-modal/payment-modal.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CreditCardDirectivesModule } from 'angular-cc-library';

@NgModule({
  declarations: [
    PlaceOrderComponent,
    GoogleMapComponent,
    PaymentModalComponent,
  ],
  imports: [
    CommonModule,
    CheckoutRoutingModule,
    NgZorroModule,
    ReactiveFormsModule,
    FormsModule,
    CreditCardDirectivesModule,
  ],
})
export class CheckoutModule {}
