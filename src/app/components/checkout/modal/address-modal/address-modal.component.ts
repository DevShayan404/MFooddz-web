import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { CheckoutService } from '../../service/checkout.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HomeService } from '../../../home/service/home.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-address-modal',
  templateUrl: './address-modal.component.html',
  styleUrl: './address-modal.component.css',
})
export class AddressModalComponent {
  @Input() isVisible!: boolean;
  @Input() currentLocation: any;
  @Output() close = new EventEmitter<void>();
  @Output() changedLocation = new EventEmitter<void>();
  isvisibleFormModal: boolean = false;
  addressForm!: FormGroup;
  savedLocationList!: any[];
  center: google.maps.LatLngLiteral = { lat: 0, lng: 0 };
  zoom: number = 16;
  marked: google.maps.MarkerOptions = {
    position: { lat: 0, lng: 0 },
    icon: {
      url: 'assets/icons/pin.png',
      scaledSize: new google.maps.Size(40, 40),
    },
  };
  constructor(
    private service: CheckoutService,
    private fb: FormBuilder,
    private homeService: HomeService,
    private cdr: ChangeDetectorRef,
    private activatedRoute: ActivatedRoute
  ) {}
  ngOnInit(): void {
    this.addressForm = this.fb.group({
      label: ['', Validators.required],
      appartment: ['', Validators.required],
      businessName: ['', Validators.required],
      street: [''],
      area: ['', Validators.required],
    });
    this.getSavedLocations();
  }
  getSavedLocations() {
    this.service.getSavedLocations().subscribe({
      next: (res) => {
        this.savedLocationList = JSON.parse(res?.Result?.Data)?.LocationsList;
      },
    });
  }

  addressModalClose() {
    this.close.emit();
  }
  formModalOpen() {
    this.isvisibleFormModal = true;
    this.center = {
      lat: this.currentLocation?.lat,
      lng: this.currentLocation?.lng,
    };
    this.marked = {
      position: {
        lat: this.currentLocation?.lat,
        lng: this.currentLocation?.lng,
      },
      icon: {
        url: 'assets/icons/pin.png',
        scaledSize: new google.maps.Size(40, 40),
      },
    };
  }
  formModalClose() {
    this.isvisibleFormModal = false;
  }

  onSubmit() {
    if (this.addressForm.valid) {
      this.service
        .postAddress({
          Area: this.addressForm.value.area,
          BuildingName: this.addressForm.value.businessName,
          Street: this.addressForm.value.street,
          LocationPurpose: this.addressForm.value.label,
          HouseNo: this.addressForm.value.appartment,
          CustomerId: parseFloat(localStorage.getItem('custId')!),
          Detail: null,
          Latitude: this.currentLocation?.lat,
          LocationName: this.currentLocation?.address,
          Longitude: this.currentLocation?.lng,
          CityName: localStorage.getItem('city')!,
          CountryCode: `+${this.activatedRoute.snapshot.queryParams['countryCode']}`,
        })
        .subscribe({
          next: (res) => {
            console.log(res);
            this.getSavedLocations();
            this.isvisibleFormModal = false;
          },
        });
    } else {
      Object.values(this.addressForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }
  // ===== map ======

  onMapClick(event: google.maps.MapMouseEvent) {
    const latLng = event.latLng;

    if (latLng) {
      this.marked = {
        position: { lat: latLng.lat(), lng: latLng.lng() },
        icon: {
          url: 'assets/icons/pin.png',
          scaledSize: new google.maps.Size(40, 40),
        },
      };

      const latlngString = `${latLng.lat()},${latLng.lng()}`;
      this.homeService.getCurrentLocation(latlngString).subscribe({
        next: (data: any) => {
          const addressComponents = data.results[0]?.address_components ?? [];
          let areaName = '';
          for (let component of addressComponents) {
            if (
              component.types.includes('sublocality') ||
              component.types.includes('locality')
            ) {
              areaName = component.long_name;
              break;
            }
          }
          const formattedAddress = data.results[0]?.formatted_address ?? '';
          this.cdr.detectChanges();
          this.currentLocation = {
            area: areaName,
            address: formattedAddress,
            lat: latLng.lat(),
            lng: latLng.lng(),
          };
        },
        error: (error) => console.log(error),
      });
    }
  }
  selectedLocationIndex: number | null = null;
  changedLocationData: any;
  onLocationChange(index: number, data: any) {
    this.changedLocationData = data;
    this.selectedLocationIndex = index;
    const selectedLocation = this.savedLocationList[index];
  }
  onSubmitChangedAddress() {
    this.changedLocation.emit(this.changedLocationData);
    this.addressModalClose();
  }
}
