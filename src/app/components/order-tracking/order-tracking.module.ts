import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OrderTrackingRoutingModule } from './order-tracking-routing.module';
import { TrackComponent } from './track/track.component';
import { NgZorroModule } from '../../shared-modules/ng-zorro/ng-zorro.module';
import { GoogleMapComponent } from './track/google-map/google-map.component';

@NgModule({
  declarations: [TrackComponent, GoogleMapComponent],
  imports: [CommonModule, OrderTrackingRoutingModule, NgZorroModule],
})
export class OrderTrackingModule {}
