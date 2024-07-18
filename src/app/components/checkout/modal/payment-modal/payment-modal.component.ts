import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CheckoutService } from '../../service/checkout.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CreditCard, CreditCardValidators } from 'angular-cc-library';
import { defer } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-payment-modal',
  templateUrl: './payment-modal.component.html',
  styleUrl: './payment-modal.component.css',
})
export class PaymentModalComponent {
  @Input() isVisible!: boolean;
  @Output() close = new EventEmitter<void>();
  @Output() PaymentData = new EventEmitter<void>();
  isVisibleaddCreditOrDebitModal: boolean = false;
  countryList!: any[];
  cardForm!: FormGroup;
  cardResponse: any;
  spinner!: boolean;
  savedCardList!: any[];
  countryCode!: number;
  constructor(
    private service: CheckoutService,
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe((params) => {
      this.countryCode = +params['countryCode'];
      console.log(this.countryCode);
      if (this.countryCode !== 92) {
        this.service.getSavedCard().subscribe({
          next: (res: any) => {
            this.savedCardList = res?.Result?.cardList;
            console.log(this.savedCardList);
          },
        });
        this.cardForm = this.fb.group({
          cardNumder: ['', [CreditCardValidators.validateCCNumber]],
          expDate: ['', [CreditCardValidators.validateExpDate]],
          securityCode: [
            '',
            [
              Validators.required,
              Validators.minLength(3),
              Validators.maxLength(3),
            ],
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

  onSubmit() {
    if (this.cardForm.valid) {
      this.spinner = true;
      this.service
        .postCardForm({
          CustomerId: parseFloat(localStorage.getItem('custId')!),
          CardNumber: this.cardForm.value.cardNumder.replace(/\s+/g, ''),
          ExpiryDate: this.cardForm.value.expDate.replace(/\s|\//g, ''),
          CVV: +this.cardForm.value.securityCode,
          CardType: CreditCard.cardType(this.cardForm.value?.cardNumder),
          CardHolderName: this.cardForm.value.cardHolderName,
        })
        .subscribe({
          next: (res: any) => {
            this.cardResponse = res?.Result;
            if (res?.Result?.Code === '00') {
              this.isVisibleaddCreditOrDebitModal = false;
            }
            this.cardForm.reset();
            this.spinner = false;
          },
        });
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
  paymentData: any;
  onSelect(data: any) {
    this.paymentData = data;
  }
  submitPaymentData() {
    this.PaymentData.emit(this.paymentData);
    this.paymentModalClose();
  }
}
