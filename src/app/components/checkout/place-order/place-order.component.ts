import { Component } from '@angular/core';
import { SharingService } from '../../../core/sharing-service/sharing.service';

@Component({
  selector: 'app-place-order',
  templateUrl: './place-order.component.html',
  styleUrl: './place-order.component.css',
})
export class PlaceOrderComponent {
  options = ['Delivery', 'PickUp', 'Dine-in'];
  tip = ['$ 0.00', '$ 0.00', '$ 0.00', 'others'];
  isVisibleOrderSummary: boolean = true;
  restaurantData!: any[];
  shopData!: any[];
  cartData: any[] = [];
  subTotal!: number;
  deliveryFee!: number;
  currency!: string;
  gstRate!: number;
  discountAmount: number = 0;
  totalAmount!: number;

  constructor(private sharingService: SharingService) {}

  ngOnInit(): void {
    this.sharingService.showFooter(false);
    this.sharingService.showNavbar(false);
    this.getRestaurantDetail();
    this.calculate();
  }
  getRestaurantDetail() {
    this.shopData = JSON.parse(localStorage.getItem('shopData')!);
    this.restaurantData = JSON.parse(localStorage.getItem('restaurantList')!);
    this.cartData = JSON.parse(localStorage.getItem('cartList')!);
    // console.log(this.cartData);
  }

  calculate() {
    this.subTotal = this.cartData.reduce((acc, item) => {
      // Add BaseAmount of the main item
      acc += item.BaseAmount;

      // Check if the item has SubMenu
      if (item.SubMenu && item.SubMenu.length > 0) {
        // Iterate through each SubMenu
        item.SubMenu.forEach((subMenu: any) => {
          // Check if SubMenu has SubMenuHedaer
          if (subMenu.SubMenuHedaer && subMenu.SubMenuHedaer.length > 0) {
            // Iterate through each SubMenuHedaer
            subMenu.SubMenuHedaer.forEach((subMenuHeader: any) => {
              // Add Amount from SubMenuHedaer to acc
              acc += subMenuHeader.Amount;
            });
          }
        });
      }

      return acc;
    }, 0);

    this.cartData.forEach((item) => {
      if (item.DiscountAmount !== null) {
        let discountedAmount = item.BaseAmount - item.DiscountAmount;
        if (discountedAmount % 1 !== 0) {
          this.discountAmount = Math.floor(discountedAmount + 1);
        } else {
          this.discountAmount = discountedAmount;
        }
      }
    });

    this.deliveryFee = this.shopData[0]?.ShopFinancials[0]?.DeliveryFee;
    this.currency = this.shopData[0]?.ShopFinancials[0]?.Currency;
    const gst =
      (this.subTotal * this.shopData[0]?.ShopFinancials[0]?.GST) / 100;
    if (gst % 1 !== 0) {
      this.gstRate = Math.floor(gst + 1);
    } else {
      this.gstRate = gst;
    }

    this.totalAmount =
      this.subTotal - this.discountAmount + this.deliveryFee + this.gstRate;
  }

  handleIndexChange(e: number): void {
    console.log(e);
  }

  showOrdersSummary() {
    this.isVisibleOrderSummary = !this.isVisibleOrderSummary;
  }
  // ===========Payment Modal============ //
  isVisiblePaymentModal: boolean = false;
  paymentModalOpen() {
    this.isVisiblePaymentModal = true;
  }
  paymentModalClose() {
    this.isVisiblePaymentModal = false;
  }
}
