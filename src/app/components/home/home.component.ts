import { ChangeDetectorRef, Component } from '@angular/core';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { SharingService } from '../../core/sharing-service/sharing.service';
import { HomeService } from './service/home.service';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  promoList: any[] = [
    {
      id: 1,
    },
    {
      id: 1,
    },
    {
      id: 1,
    },
    {
      id: 1,
    },
    {
      id: 1,
    },
  ];
  whyMFood: any[] = [
    {
      tittle: 'Quickest ',
      description: 'GrabFood provides the fastest food delivery in the market.',
    },
    {
      tittle: 'Easiest ',
      description:
        'Now grabbing your food is just a few clicks or taps away. Order online or download our Grab super app for a faster and more rewarding experience.',
    },
    {
      tittle: 'Food for all cravings ',
      description:
        'From local fare to restaurant favourites, our wide selection of food will definitely satisfy all your cravings.',
    },
    {
      tittle: 'Pay with ease  ',
      description:
        'It’s easy to get your meals delivered to you. It’s even easier to pay for it with GrabPay.',
    },
    {
      tittle: 'More Rewarding ',
      description:
        'earn GrabRewards points for every order you make and use them to redeem more goodies.',
    },
  ];
  customOptions: OwlOptions = {
    loop: false,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: false,
    dots: false,
    navSpeed: 700,
    navText: [
      '<i class="bi bi-chevron-left"></i>',
      '<i class="bi bi-chevron-right"></i>',
    ],
    margin: 20,
    stagePadding: 5,
    responsive: {
      0: {
        items: 1,
      },
      400: {
        items: 2,
      },
      740: {
        items: 3,
      },
      940: {
        items: 4,
      },
    },
    nav: true,
  };

  locationForm: FormGroup<{
    location: FormControl<string | null>;
  }> = this.fb.group({
    location: this.fb.control<string | null>(null, Validators.required),
  });
  country!: string;
  savedLocationList!: any[];
  // currentLocation!: string | null;
  spinner: boolean = false;
  lat: any;
  long: any;
  selectedLocation!: string | null;
  popularRestaurant!: any[];
  constructor(
    private sharingService: SharingService,
    private service: HomeService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.sharingService.showFooter(true);
    this.sharingService.getCountry().subscribe({
      next: (res) => {
        this.service.getSavedLocation(res).subscribe({
          next: (res: any) => {
            let data = JSON.parse(res?.Result?.Data);
            this.savedLocationList = data?.Locations;
          },
        });
      },
    });

    this.service
      .getRestaurants(+localStorage.getItem('countryCode')!)
      .subscribe({
        next: (res: any) => {
          this.popularRestaurant = JSON.parse(
            res?.Result?.Data
          )?.Restaurant[0]?.PopularRestaurant;
        },
      });
  }

  submitForm() {
    if (this.locationForm.valid) {
      const latLng = this.locationForm.value.location;
      const custId = localStorage.getItem('custId');
      // console.log(custId);

      const countryCode = localStorage.getItem('countryCode');
      if (latLng && custId) {
        const [lat, lng] = latLng
          .split(', ')
          .map((coord: string) => parseFloat(coord));
        this.router.navigate(['restaurant'], {
          queryParams: {
            lat: lat,
            lng: lng,
            custId: custId,
            countryCode: countryCode,
          },
        });
      } else {
        this.router.navigate(['authentication']);
      }
    } else {
      Object.values(this.locationForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  getCurrentLocation() {
    this.spinner = true;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latlng = `${position.coords.latitude},${position.coords.longitude}`;
        this.service.getCurrentLocation(latlng).subscribe({
          next: (data: any) => {
            // console.log(data);
            this.selectedLocation = data?.results[0]?.formatted_address;
            this.locationForm.patchValue({
              location: `${data.results[0]?.geometry?.location?.lat}, ${data.results[0]?.geometry?.location?.lng}`,
            });
            this.spinner = false;
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.log(err);
          },
        });
        // const coordinates = latlng.split(',');
        // this.lat = coordinates[0];
        // this.long = coordinates[1];
        // localStorage.setItem('lat', this.lat);
        // localStorage.setItem('long', this.long);
        // const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latlng}&key=AIzaSyBoggmNYAGO4585YCVDhYsQOrr_YLl_pYs`;

        // this.http.get(url).subscribe(
        //   (data: any) => {
        //     this.spinner = false;
        //     if (data.status === 'OK') {
        //       this.currentLocation = data.results[0].formatted_address;
        //     } else {
        //       console.log('Geocoding failed: ' + data.status);
        //     }
        //   },
        //   (error) => console.log(error)
        // );
      },
      (error) => console.log(error)
    );
  }

  clearLocation() {
    this.selectedLocation = null;
  }

  changeLocation(data: any) {
    // console.log(data);
  }

  ngOnDestroy(): void {}
}
