import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { authGuard } from './core/auth/auth.guard';

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
    loadChildren: () =>
      import('./components/checkout/checkout.module').then(
        (m) => m.CheckoutModule
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
