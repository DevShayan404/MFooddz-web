import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { SharingService } from '../../../core/sharing-service/sharing.service';
import { HomeService } from '../../home/service/home.service';
import { ActivatedRoute, Router } from '@angular/router';

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
  currentLocation: any;
  switchToSegmented: string = 'Delivery';

  constructor(
    private sharingService: SharingService,
    private cdr: ChangeDetectorRef,
    private homeService: HomeService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.sharingService.showFooter(false);
    this.sharingService.showNavbar(false);
    this.getRestaurantDetail();
    this.calculate();
    this.getCurrentLocation();
  }
  getRestaurantDetail() {
    this.shopData = JSON.parse(localStorage.getItem('shopData')!);
    this.restaurantData = JSON.parse(localStorage.getItem('restaurantList')!);
    this.cartData = JSON.parse(localStorage.getItem('cartList')!);
    // console.log(this.cartData);
  }

  calculate() {
    this.totalAmount = 0;
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
      } else {
        acc *= item?.Quantity;
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

    if (this.switchToSegmented === 'Delivery') {
      this.totalAmount =
        this.subTotal - this.discountAmount + this.deliveryFee + this.gstRate;
    } else {
      this.totalAmount = this.subTotal - this.discountAmount + this.gstRate;
    }
  }

  handleIndexChange(e: number): void {
    switch (e) {
      case (e = 0): {
        this.switchToSegmented = 'Delivery';
        this.calculate();
        break;
      }
      case (e = 1): {
        this.switchToSegmented = 'PickUp';
        this.calculate();
        break;
      }
      case (e = 2): {
        this.switchToSegmented = 'Dine-in';
        this.calculate();
        break;
      }
      default: {
        this.switchToSegmented = 'Delivery';
        this.calculate();
        break;
      }
    }
  }
  routeToMenuPage() {
    this.router.navigate(['restaurant/menu'], {
      queryParams: this.activatedRoute.snapshot.queryParams,
    });
  }
  showOrdersSummary() {
    this.isVisibleOrderSummary = !this.isVisibleOrderSummary;
  }
  // -----------------

  getCurrentLocation() {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latlng = `${position.coords.latitude},${position.coords.longitude}`;
        this.homeService.getCurrentLocation(latlng).subscribe({
          next: (data: any) => {
            const addressComponents = data.results[0].address_components;
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
            const formattedAddress = data.results[0].formatted_address;

            this.currentLocation = {
              area: areaName,
              address: formattedAddress,
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            this.cdr.detectChanges();
          },
          error: (error) => console.log(error),
        });
      },
      (error) => console.log(error)
    );
  }

  // =========== Modal============ //
  isVisiblePaymentModal: boolean = false;
  isVisibleAddressModal: boolean = false;
  isVisiblePromoModal: boolean = false;
  paymentModalOpen() {
    this.isVisiblePaymentModal = true;
  }
  paymentModalClose() {
    this.isVisiblePaymentModal = false;
  }

  addressModalOpen() {
    this.isVisibleAddressModal = true;
  }
  addressModalClose() {
    this.isVisibleAddressModal = false;
  }
  changedLocation(data: any) {
    const [lat, lng] = data?.LocationCoordinates.split(',').map((coord: any) =>
      parseFloat(coord)
    );
    this.currentLocation = {
      area: data.Area,
      address: data.LocationAddress,
      lat: lat,
      lng: lng,
    };
    this.cdr.detectChanges();
    // console.log('Received data from child:', this.currentLocation);
  }

  promoModalOpen() {
    this.isVisiblePromoModal = true;
  }
  promoModalClose() {
    this.isVisiblePromoModal = false;
  }
}
