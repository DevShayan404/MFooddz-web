import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CheckoutService } from '../../service/checkout.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CreditCard, CreditCardValidators } from 'angular-cc-library';
import { defer } from 'rxjs';

@Component({
  selector: 'app-payment-modal',
  templateUrl: './payment-modal.component.html',
  styleUrl: './payment-modal.component.css',
})
export class PaymentModalComponent {
  @Input() isVisible!: boolean;
  @Output() close = new EventEmitter<void>();
  isVisibleaddCreditOrDebitModal: boolean = false;
  countryList!: any[];
  cardForm!: FormGroup;
  constructor(private service: CheckoutService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.cardForm = this.fb.group({
      cardNumder: ['', [CreditCardValidators.validateCCNumber]],
      expDate: ['', [CreditCardValidators.validateExpDate]],
      securityCode: [
        '',
        [Validators.required, Validators.minLength(3), Validators.maxLength(3)],
      ],
      country: ['', Validators.required],
      cardHolderName: ['', Validators.required],
    });
    this.service.getCountries().subscribe({
      next: (res: any) => {
        this.countryList = res?.data;
        this.cardForm.get('country')?.setValue('Canada');
      },
    });
  }

  paymentModalClose() {
    this.close.emit();
  }
  addCreditOrDebitModalOpen() {
    this.isVisibleaddCreditOrDebitModal = true;
  }
  addCreditOrDebitModalClose() {
    this.isVisibleaddCreditOrDebitModal = false;
  }

  // ------------------------------
  onSubmitCardForm() {
    if (this.cardForm.valid) {
      const obj = {
        CustomerId: parseFloat(localStorage.getItem('custId')!),
        CardNumber: this.cardForm.value.cardNumder.replace(/\s+/g, ''),
        ExpiryDate: this.cardForm.value.expDate.replace(/\s|\//g, ''),
        CVV: +this.cardForm.value.securityCode,
        CardType: CreditCard.cardType(this.cardForm.value?.cardNumder),
        CardHolderName: this.cardForm.value.cardHolderName,
      };
      console.log(obj);
      // this.cardForm.reset();
    } else {
      Object.values(this.cardForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }
}
