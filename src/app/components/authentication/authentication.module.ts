import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthenticationRoutingModule } from './authentication-routing.module';
import { LoginComponent } from './login/login.component';
import { NgZorroModule } from '../../shared-modules/ng-zorro/ng-zorro.module';
import { UserProfileComponent } from './user-profile/user-profile.component';


@NgModule({
  declarations: [
    LoginComponent,
    UserProfileComponent
  ],
  imports: [
    CommonModule,
    AuthenticationRoutingModule,
    NgZorroModule
  ]
})
export class AuthenticationModule { }
