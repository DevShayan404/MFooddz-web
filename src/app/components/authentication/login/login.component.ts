import { Component } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { LoginService } from './service/login.service';
import { NavigationEnd, Router } from '@angular/router';
import { SharingService } from '../../../core/sharing-service/sharing.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  LoginForm: FormGroup<{
    country: FormControl<string | null>;
    phoneNo: FormControl<string | null>;
  }> = this.fb.group({
    country: this.fb.control<string | null>(null, Validators.required),
    phoneNo: this.fb.control<string | null>(null, Validators.required),
  });
  otpForm: FormGroup<{
    otp: FormControl<string | null>;
  }> = this.fb.group({
    otp: this.fb.control<string | null>(null, Validators.required),
  });
  userDetailForm: FormGroup<{
    firstName: FormControl<string | null>;
    lastName: FormControl<string | null>;
  }> = this.fb.group({
    firstName: this.fb.control<string | null>(null, Validators.required),
    lastName: this.fb.control<string | null>(null, Validators.required),
  });

  route: string = 'login';
  countryList: any[] = [];
  spinner!: boolean;
  phoneNo!: string | number;
  code!: string | number;
  message!: string;
  verficationCode!: string | number;
  firstName!: string;
  custId!: any;
  countryCode!: string;
  constructor(
    private fb: FormBuilder,
    private service: LoginService,
    private router: Router,
    private sharingService: SharingService
  ) {}

  ngOnInit(): void {
    this.sharingService.showNavbar(false);
    this.sharingService.showFooter(false);
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const showNavbar = event.url === '/';
        this.sharingService.showNavbar(showNavbar);
        this.sharingService.showFooter(showNavbar);
      }
    });

    this.service.getCountryList().subscribe({
      next: (data: any) => {
        let res = JSON.parse(data?.Result?.Data);
        this.countryList = res.Countries;
      },
    });
  }

  submitForm(): void {
    switch (this.route) {
      case 'login':
        if (this.LoginForm.valid) {
          this.spinner = true;
          this.service
            .postLogin({
              PhoneNumber: this.LoginForm.value.phoneNo,
              CountryCode: this.LoginForm.value.country,
              AuthenticationId: '',
            })
            .subscribe({
              next: (data: any) => {
                if (data?.Result?.Code === '00') {
                  this.phoneNo = this.LoginForm.value.phoneNo!;
                  this.code = data?.Result?.CountryCode;
                  this.message = data?.Result?.Message;
                } else {
                  this.phoneNo = this.LoginForm.value.phoneNo!;
                  this.code = this.LoginForm.value.country!;
                  this.message = data?.Result?.Message;
                }
                setTimeout(() => {
                  this.otpForm = this.fb.group({
                    otp: this.fb.control<string | null>(
                      data?.Result?.VerificationCode,
                      Validators.required
                    ),
                  });
                }, 500);
                this.verficationCode = data?.Result?.VerificationCode;
                this.firstName = data?.Result?.FirstName;
                this.custId = data?.Result?.UserId;

                this.countryCode = data?.Result?.CountryCode.replace('+', '');
                console.log(this.countryCode);
                this.LoginForm.reset();
                this.spinner = false;
                this.route = 'otp';
              },
            });
        } else {
          Object.values(this.LoginForm.controls).forEach((control) => {
            if (control.invalid) {
              control.markAsDirty();
              control.updateValueAndValidity({ onlySelf: true });
            }
          });
        }
        break;
      case 'otp':
        if (this.otpForm.valid) {
          this.spinner = true;
          if (this.otpForm.value.otp === this.verficationCode) {
            if (this.firstName !== null) {
              localStorage.setItem('firstName', this.firstName);
              localStorage.setItem('custId', this.custId);
              localStorage.setItem('countryCode', this.countryCode);
              this.router.navigate(['']);
            } else {
              this.spinner = false;
              this.route = 'user-detail';
            }
          } else {
            this.spinner = false;
            alert('Invalid code');
          }
        } else {
          Object.values(this.otpForm.controls).forEach((control) => {
            if (control.invalid) {
              control.markAsDirty();
              control.updateValueAndValidity({ onlySelf: true });
            }
          });
        }
        break;
      case 'user-detail':
        if (this.userDetailForm.valid) {
          this.spinner = true;

          this.service
            .postCustomerName({
              PhoneNumber: this.phoneNo,
              CountryCode: this.code,
              Email: '',
              FirstName: this.userDetailForm.value.firstName,
              LastName: this.userDetailForm.value.lastName,
              Password: '',
            })
            .subscribe({
              next: (data: any) => {
                localStorage.setItem('firstName', data?.Result?.FirstName);
                localStorage.setItem('custId', data?.Result?.UserId);
                localStorage.setItem('countryCode', this.countryCode);
                this.userDetailForm.reset();
                this.router.navigate(['']);
                this.spinner = false;
              },
            });
        } else {
          Object.values(this.userDetailForm.controls).forEach((control) => {
            if (control.invalid) {
              control.markAsDirty();
              control.updateValueAndValidity({ onlySelf: true });
            }
          });
        }
        break;
    }
  }
}
