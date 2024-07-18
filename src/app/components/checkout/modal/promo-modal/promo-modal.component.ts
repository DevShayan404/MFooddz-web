import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CheckoutService } from '../../service/checkout.service';

@Component({
  selector: 'app-promo-modal',
  templateUrl: './promo-modal.component.html',
  styleUrl: './promo-modal.component.css',
})
export class PromoModalComponent {
  @Input() isVisible!: boolean;
  @Output() close = new EventEmitter<void>();
  @Output() applyCoupon = new EventEmitter<void>();
  promoForm!: FormGroup;
  constructor(
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private service: CheckoutService
  ) {}
  ngOnInit() {
    this.promoForm = this.fb.group({
      promo: ['', Validators.required],
    });
  }

  PromoModalClose() {
    this.close.emit();
  }
  promoCodeResponse: any;
  onSubmit() {
    if (this.promoForm.valid) {
      const countryCode =
        this.activatedRoute.snapshot.queryParams['countryCode'];
      if (countryCode === 92) {
        const rideTypeId = 1045;
        this.service
          .getPromoCode(rideTypeId, this.promoForm.value.promo)
          .subscribe({
            next: (res) => {
              this.promoCodeResponse = res?.Result;
              if (this.promoCodeResponse?.Code === '00') {
                this.applyCoupon.emit(this.promoCodeResponse);
                this.PromoModalClose();
              }
              this.promoForm.reset();
            },
          });
      } else {
        const rideTypeId = 1046;
        this.service
          .getPromoCode(rideTypeId, this.promoForm.value.promo)
          .subscribe({
            next: (res) => {
              this.promoCodeResponse = res?.Result;
              if (this.promoCodeResponse?.Code === '00') {
                this.applyCoupon.emit(this.promoCodeResponse);
                this.PromoModalClose();
              }
              this.promoForm.reset();
            },
          });
      }
    } else {
      Object.values(this.promoForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }
}
