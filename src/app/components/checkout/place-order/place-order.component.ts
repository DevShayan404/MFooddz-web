import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { SharingService } from '../../../core/sharing-service/sharing.service';
import { HomeService } from '../../home/service/home.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CheckoutService } from '../service/checkout.service';

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
  paymentId: number = 0;
  constructor(
    private sharingService: SharingService,
    private cdr: ChangeDetectorRef,
    private homeService: HomeService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private service: CheckoutService
  ) {}

  ngOnInit(): void {
    this.sharingService.showFooter(false);
    this.sharingService.showNavbar(false);
    this.getRestaurantDetail();
    this.calculate();
    this.getCurrentLocation();
    const country = +localStorage.getItem('countryCode')!;
    if (country === 92) {
      this.paymentId = 1;
    } else {
      this.paymentId = 2;
    }
  }
  // ngOnDestroy(): void {
  //   this.sharingService.showFooter(true);
  //   this.sharingService.showNavbar(true);
  // }
  getRestaurantDetail() {
    this.shopData = JSON.parse(localStorage.getItem('shopData')!);
    this.restaurantData = JSON.parse(localStorage.getItem('restaurantList')!);
    this.cartData = JSON.parse(localStorage.getItem('cartList')!);
    // console.log(this.cartData);
  }

  menuDiscount: number = 0;
  calculate() {
    this.totalAmount = 0;
    this.subTotal = this.cartData?.reduce((acc, item) => {
      // Add BaseAmount of the main item
      acc += item.BaseAmount;

      // Check if the item has SubMenu
      if (item.SubMenu && item.SubMenu?.length > 0) {
        // Iterate through each SubMenu
        item.SubMenu?.forEach((subMenu: any) => {
          // Check if SubMenu has SubMenuHedaer
          if (subMenu.SubMenuHedaer && subMenu.SubMenuHedaer?.length > 0) {
            // Iterate through each SubMenuHedaer
            subMenu.SubMenuHedaer?.forEach((subMenuHeader: any) => {
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

    if (this.discountAmount === 0) {
      this.cartData?.forEach((item) => {
        if (item.DiscountAmount !== null) {
          let discountedAmount = item.BaseAmount - item.DiscountAmount;
          if (discountedAmount % 1 !== 0) {
            this.discountAmount += Math.floor(discountedAmount + 1);
            this.menuDiscount = Math.floor(discountedAmount + 1);
            // console.log(this.discountAmount);
          } else {
            this.discountAmount += discountedAmount;
            this.menuDiscount = discountedAmount;
            // console.log(this.discountAmount);
          }
        }
      });
    }

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
            const addressComponents = data?.results[0]?.address_components;
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
            const formattedAddress = data?.results[0]?.formatted_address;

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
  // ----------Child data----------
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
  // ----------Child data----------
  counponAmount: number = 0;
  counponId: number = 0;
  applyCoupon(data: any) {
    // console.log(data);

    this.discountAmount += parseFloat(data?.Amount);
    this.counponAmount = data?.Amount;
    this.counponId = data?.CouponId;
    this.calculate();
    this.cdr.detectChanges();
  }

  // -----------Place Order--------------
  placeOrderSpinner: boolean = false;
  placeOrder() {
    this.placeOrderSpinner = true;
    const OrderDetailJson: any[] = [];
    const OrderDetails: any[] = [];

    this.cartData.forEach((item) => {
      if (item?.SubMenuId === null) {
        // ---------OrderDetailJson---------
        const OrderDetailJsonObj = {
          Quantity: +item?.Quantity,
          subMenuDetail: '',
          Price: +item?.BaseAmount,
          MenuId: +item?.MenuId,
        };
        OrderDetailJson.push(OrderDetailJsonObj);
        // ---------OrderDetails---------
        const OrderDetailsObj = {
          Name: item.Name,
          Quantity: +item?.Quantity,
          MenuId: +item?.MenuId,
          Price: +item?.BaseAmount,
        };
        OrderDetails.push(OrderDetailsObj);
      } else {
        const menuItemsDetail: any[] = [];
        const names: string[] = [];
        const DealItems: any[] = [];
        item.SubMenu.forEach((subMenuList: any) => {
          // ---------OrderDetailJson---------
          const obj = {
            MenuId: +subMenuList.MenuId,
            SubMenuId: +subMenuList.SubMenuId,
            Name: subMenuList.Name,
            Description: subMenuList.Description,
            Amount: subMenuList.Amount,
            IsParent: subMenuList.IsParent,
            UpTo: subMenuList.UpTo,
            ParentId: 0,
            TopParent: subMenuList.SubMenuId,
            SelectorNumber: subMenuList.SelectorNumber,
            MinQuantity: subMenuList.MinQuantity,
            MaxQuantity: subMenuList.MaxQuantity,
            SelectionAmount: 0,
            Quantity: 1,
          };
          menuItemsDetail.push(obj);
          subMenuList.SubMenuHedaer.forEach((subMenuHedaerList: any) => {
            // ---------OrderDetailJson---------
            const jsonObj = {
              MenuId: subMenuHedaerList.MenuId,
              SubMenuId: subMenuHedaerList.SubMenuId,
              Name: subMenuHedaerList.Name,
              Description: subMenuHedaerList.Description,
              Amount: subMenuHedaerList.Amount,
              IsParent: subMenuHedaerList.IsParent,
              UpTo: subMenuHedaerList.UpTo,
              ParentId: subMenuList.SubMenuId,
              TopParent: subMenuList.SubMenuId,
              MinQuantity: subMenuHedaerList.MinQuantity,
              MaxQuantity: subMenuHedaerList.MaxQuantity,
              Quantity: 1,
            };
            menuItemsDetail.push(jsonObj);
            names.push(subMenuHedaerList.Name);
            // ---------OrderDetails---------
            const detailObj = {
              MenuId: subMenuList.MenuId,
              SubMenuId: subMenuList.SubMenuId,
              Name: subMenuList.Name,
              ParentId: subMenuList.ParentId,
              Amount: subMenuList.Amount,
              SubMenu: [
                {
                  MenuId: subMenuHedaerList.MenuId,
                  SubMenuId: subMenuHedaerList.SubMenuId,
                  Name: subMenuHedaerList.Name,
                  Description: subMenuHedaerList.Description,
                  Amount: subMenuHedaerList.Amount,
                  IsParent: subMenuHedaerList.ParentId,
                  UpTo: subMenuHedaerList.UpTo,
                  MinQuantity: subMenuHedaerList.MinQuantity,
                  MaxQuantity: subMenuHedaerList.MaxQuantity,
                  ParentId: subMenuList.SubMenuId,
                  TopParent: subMenuList.SubMenuId,
                  Quantity: 1,
                  InnerShowSelection: {
                    String: '',
                    Amount: 0,
                  },
                },
              ],
              ParentName: subMenuList.Name,
            };
            DealItems.push(detailObj);
          });
        });
        // ---------OrderDetailJson---------
        const OrderDetailJsonObj = {
          Quantity: item?.Quantity,
          subMenuDetail: names.join(', '),
          Price: item?.BaseAmount,
          MenuId: item?.MenuId,
          MenuItemsDetail: menuItemsDetail,
        };
        OrderDetailJson.push(OrderDetailJsonObj);
        // ---------OrderDetails---------
        const OrderDetailsObj = {
          Name: item?.Name,
          Quantity: item?.Quantity,
          MenuId: +item?.MenuId,
          DealItems: DealItems,
        };
        OrderDetails.push(OrderDetailsObj);
      }
    });

    const PlaceOrder = {
      CustId: localStorage.getItem('custId')!,
      ShopId: this.restaurantData[0]?.Id,
      DeliveryType: 1,
      PickupAddr: this.shopData[0]?.ShopLocation[0]?.Address,
      PickupLat: this.shopData[0]?.ShopLocation[0]?.Latitude,
      PickupLong: this.shopData[0]?.ShopLocation[0]?.Longitude,
      DropoffAddr: this.currentLocation.address,
      DropoffLat: this.currentLocation.lat,
      DropoffLong: this.currentLocation.lng,
      OrderDetailJson: JSON.stringify({ OrderDetailJson: OrderDetailJson }),
      OrderDetailsNew: JSON.stringify({ OrderDetails: OrderDetails }),
      TotalBill: +this.totalAmount,
      DeliveryFee: +this.deliveryFee,
      GST: +this.gstRate,
      MenuDiscount: +this.menuDiscount,
      CouponAmount: +this.counponAmount,
      CouponId: +this.counponId,
      PhoneNumber: `+${localStorage.getItem(
        'countryCode'
      )}${localStorage.getItem('phoneNo')}`,
      PaymentTypeId: this.paymentId,
      // /////
      AddNote: '',
      CardId: 0,
      ChangeChange: true,
      DropInstruction: null,
      InstructionsTypeID: 1,
      OrderInstructionsJson: '{"OrderInstructionsJson":[]}',
      Tip: 0,
      Wallet: 0,
      WalletDeduction: 0,
      WalletDeductionPoints: 0,
      isVoucher: 0,
    };
    this.service.placeOrder(PlaceOrder).subscribe({
      next: (res) => {
        // console.log(JSON.parse(res?.Result?.Data));
        this.router.navigate(
          ['order-tracking']
          // , {
          // queryParams: {
          //   custId: +localStorage.getItem('custId')!,
          // },
          // }
        );
        localStorage.removeItem('cartList');
        localStorage.removeItem('restaurantList');
        localStorage.removeItem('shopData');
        this.placeOrderSpinner = false;
      },
    });
  }
}
