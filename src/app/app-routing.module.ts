import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { redirectGuardGuard } from './core/guard/redirect-guard/redirect-guard.guard';
import { authGuard } from './core/guard/auth/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'restaurant',
    loadChildren: () =>
      import('./components/restaurant/restaurant.module').then(
        (m) => m.RestaurantModule
      ),
  },
  {
    path: 'checkout',
    canActivate: [redirectGuardGuard],
    loadChildren: () =>
      import('./components/checkout/checkout.module').then(
        (m) => m.CheckoutModule
      ),
  },
  {
    path: 'order-tracking',
    loadChildren: () =>
      import('./components/order-tracking/order-tracking.module').then(
        (m) => m.OrderTrackingModule
      ),
  },
  {
    path: 'authentication',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./components/authentication/authentication.module').then(
        (m) => m.AuthenticationModule
      ),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'top' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
