import { Component, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { SharingService } from '../../../core/sharing-service/sharing.service';
import { RestaurantService } from '../service/restaurant.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css',
})
export class MenuComponent {
  deliveryDate = [{ label: 'Today', value: 'Today' }];
  deliverytime = [{ label: 'Now', value: 'Now' }];
  customOptionsMenuLinks: OwlOptions = {
    loop: false,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: false,
    navSpeed: 700,
    navText: [
      '<i class="bi bi-chevron-left"></i>',
      '<i class="bi bi-chevron-right"></i>',
    ],
    margin: 20,
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
        items: 8,
      },
    },
    nav: true,
  };
  restaurantData!: any[];
  restaurantMenu!: any[];
  collapseCart: boolean = false;
  cartItems: any[] = [];
  totalAmount!: number;
  subMenuList!: any[];
  selectedSubMenu: any[] = [];
  constructor(
    private router: Router,
    private sharingService: SharingService,
    private service: RestaurantService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe((params) => {
      const shopId = params['menuId'];
      this.sharingService.getRestauranList().subscribe({
        next: (res) => {
          const restaurantList = res;
          this.restaurantData = restaurantList.filter(
            (item) => item.Id === +shopId
          );
          localStorage.setItem(
            'restaurantList',
            JSON.stringify(this.restaurantData)
          );
        },
      });
      this.service.getShopMenu(shopId).subscribe({
        next: (res: any) => {
          this.restaurantMenu = JSON.parse(
            res?.Result?.Data
          ).ShopMenu[0]?.MenuCategory;
          // console.log(this.restaurantMenu);
          this.getLocalStorageCartList();
        },
      });
    });
  }
  // -----------Scroll to--------------
  scrollToSection(section: any) {
    document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' });
  }

  // -----------Get localstorage data--------------
  getLocalStorageCartList(): void {
    const cartList = JSON.parse(localStorage.getItem('cartList')!);
    if (cartList) {
      // debugger;
      this.cartItems = cartList;
      console.log(this.cartItems);

      // -----total amount-----
      this.totalAmount = this.cartItems.reduce(
        (acc, amount) => acc + amount?.Amount,
        0
      );
      // console.log('getLocalStorageCartList', cartList);
      // console.log(this.cartItems);
    } else {
      // console.log('getLocalStorageCartList', cartList);
      // console.log(this.cartItems);
    }
  }

  // -----------Add menu in cart--------------
  addItemsInCartWithoutSubmenu(data: any) {
    const existingItem = this.cartItems.find(
      (item) => item?.MenuId === data?.MenuId
    );

    if (existingItem) {
      existingItem.Quantity++;
      if (existingItem?.DiscountAmount !== null) {
        existingItem.Amount += data?.DiscountAmount;
      } else {
        existingItem.Amount += data?.BaseAmount;
      }
    } else {
      if (data?.DiscountAmount !== null) {
        const items = {
          ...data,
          Quantity: 1,
          Amount: data?.DiscountAmount,
        };
        this.cartItems.push(items);
      } else {
        const items = {
          ...data,
          Quantity: 1,
          Amount: data?.BaseAmount,
        };
        this.cartItems.push(items);
      }
    }
    localStorage.setItem('cartList', JSON.stringify(this.cartItems));

    // -----total amount-----
    this.totalAmount = this.cartItems.reduce(
      (acc, amount) => acc + amount?.Amount,
      0
    );
  }

  // -----------Add submenu in cart --------------
  getSubmenuData(data: any) {
    this.subMenuList = [];
    this.selectedSubMenu = [];
    this.service.getShopSubmenu(data?.MenuId, data?.SubMenuId).subscribe({
      next: (res: any) => {
        const submenuItems = JSON.parse(res?.Result?.Data).ShopSubMenu[0]
          .SubMenu;
        const items = {
          ...data,
          Quantity: 1,
          Amount: data?.BaseAmount,
          SubMenu: submenuItems,
        };
        this.subMenuList = [items];
        // console.log(this.subMenuList);
      },
    });
  }

  onSubMenuChange(index: number, subMenuId: number, list: any): void {
    this.selectedSubMenu[index] = subMenuId;
    // Create a deep copy of the original menu
    const copiedSubmenu = JSON.parse(JSON.stringify(this.subMenuList));
    // Set the SubMenu array to null in the copied menu
    if (copiedSubmenu.length > 0) {
      copiedSubmenu[0].SubMenu = null;
      copiedSubmenu[0].SubMenu = [list];
    }
    // this.cartItems.push(copiedSubmenu);
    console.log(copiedSubmenu);

    // const addAmountInSubmenu = this.subMenuList.find((item) => item);
    // if (addAmountInSubmenu) {
    //   addAmountInSubmenu.Amount += list?.Amount;
    // }
    // console.log(addAmountInSubmenu);
  }

  // -----------Quantity button--------------
  decreaseQuantity(data: any): void {
    const existingItemIndex = this.cartItems.findIndex(
      (item) => item?.MenuId === data?.MenuId
    );
    if (existingItemIndex !== -1) {
      const existingItem = this.cartItems[existingItemIndex];
      if (existingItem.Quantity > 1) {
        if (existingItem?.DiscountAmount !== null) {
          existingItem.Amount -= data.DiscountAmount;
        } else {
          existingItem.Amount -= data.BaseAmount;
        }
        existingItem.Quantity--;
      } else {
        this.cartItems.splice(existingItemIndex, 1);
      }
    }
    localStorage.setItem('cartList', JSON.stringify(this.cartItems));
    // -----total amount-----
    this.totalAmount = this.cartItems.reduce(
      (acc, amount) => acc + amount?.Amount,
      0
    );
  }

  routeToCheckout() {
    // this.router.navigate(['checkout/place-order']);
  }
}
