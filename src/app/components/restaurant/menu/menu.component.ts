import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
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
  selectedSubMenu: any[] = [];
  baseAmount: any;
  totalSubmenuAmount: any;
  isVisibleCartDetail: boolean = false;
  subMenuList!: any[];
  isVisible = false;
  constructor(
    private router: Router,
    private sharingService: SharingService,
    private service: RestaurantService,
    private activatedRoute: ActivatedRoute
  ) {}

  skeleton: boolean = false;
  ngOnInit(): void {
    this.skeleton = true;
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
          const shopData = [
            {
              ShopLocation: JSON.parse(res?.Result?.Data).ShopMenu[0]
                ?.ShopLocation,
              ShopFinancials: JSON.parse(res?.Result?.Data).ShopMenu[0]
                ?.ShopFinancials,
            },
          ];
          localStorage.setItem('shopData', JSON.stringify(shopData));
          this.getLocalStorageCartList();
          // this.getSelectedSubmenu();
          this.skeleton = false;
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
      // console.log(this.cartItems);

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
  // getSelectedSubmenu(): void {
  //   const savedSelection = localStorage.getItem('selectedSubMenu');
  //   if (savedSelection) {
  //     this.selectedSubMenu = JSON.parse(savedSelection);
  //   }
  // }

  // -----------Add menu in cart--------------
  addItemsInCartWithoutSubmenu(data: any) {
    const existingItem = this.cartItems.find(
      (item) => item?.MenuId === data?.MenuId
    );

    if (existingItem) {
      existingItem.Quantity++;
      if (existingItem?.SubMenuId !== null) {
        existingItem.Amount += data?.TotalAmount;
      } else if (existingItem?.DiscountAmount !== null) {
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
    // console.log(this.cartItems);

    // -----total amount-----
    this.totalAmount = this.cartItems.reduce(
      (acc, amount) => acc + amount?.Amount,
      0
    );
  }

  // -----------Add submenu in cart --------------
  modalSkeleton: boolean = false;
  getSubmenuData(data: any) {
    this.modalSkeleton = true;
    this.openModal();
    this.subMenuList = [];
    this.selectedSubMenu = [];

    this.service.getShopSubmenu(data?.MenuId, data?.SubMenuId).subscribe({
      next: (res: any) => {
        const submenuItems = JSON.parse(res?.Result?.Data).ShopSubMenu[0]
          .SubMenu;
        const items = {
          ...data,
          Quantity: 1,
          Amount: 0,
          TotalAmount: 0,
          SubMenu: submenuItems,
        };
        this.subMenuList = [items];
        if (data?.DiscountAmount !== null) {
          if (data?.DiscountAmount % 1 !== 0) {
            this.baseAmount = Math.floor(data?.DiscountAmount + 1);
          } else {
            this.baseAmount = data?.DiscountAmount;
          }
        } else {
          if (data?.BaseAmount % 1 !== 0) {
            this.baseAmount = Math.floor(data?.BaseAmount + 1);
          } else {
            this.baseAmount = data?.BaseAmount;
          }
        }
        this.calculateTotalAmount();
        this.modalSkeleton = false;
        // console.log(this.subMenuList);
      },
    });
  }
  // //////////////////////////////////
  onSubMenuHeaderSelect(
    subMenuIndex: number,
    subMenuHeader: any,
    subMenuId: number,
    UpTo: number
  ): void {
    const existingIndex = this.selectedSubMenu.findIndex(
      (item) => item.subMenuIndex === subMenuIndex
    );
    console.log(existingIndex);

    if (existingIndex === -1) {
      this.selectedSubMenu.push({
        subMenuIndex,
        subMenuHeader,
        subMenuId,
        UpTo,
      });
    } else {
      this.selectedSubMenu[existingIndex].subMenuHeader = subMenuHeader;
    }
    // localStorage.setItem(
    //   'selectedSubMenu',
    //   JSON.stringify(this.selectedSubMenu)
    // );
    this.calculateTotalAmount();
  }

  isSelected(subMenuIndex: number, subMenuHeaderId: number): boolean {
    const selected = this.selectedSubMenu.find(
      (item) => item.subMenuIndex === subMenuIndex
    );
    return selected
      ? selected.subMenuHeader.SubMenuId === subMenuHeaderId
      : false;
  }
  ////////////////////////////////////
  onCheckboxChange(
    subMenuIndex: number,
    subMenuHeader: any,
    event: any,
    subMenuId: number
  ): void {
    const isChecked = event.target.checked;

    if (isChecked) {
      // If the checkbox is checked, deselect any previously selected items
      this.selectedSubMenu = this.selectedSubMenu.filter(
        (item) => !(item.subMenuIndex === subMenuIndex)
      );

      // Add the newly selected item to selectedSubMenu
      this.selectedSubMenu.push({ subMenuIndex, subMenuId, subMenuHeader });

      // Disable other checkboxes in the same group
      this.disableOtherCheckboxes(subMenuIndex, subMenuHeader);
    } else {
      // If the checkbox is unchecked, remove it from selectedSubMenu
      this.selectedSubMenu = this.selectedSubMenu.filter(
        (item) =>
          !(
            item.subMenuIndex === subMenuIndex &&
            item.subMenuHeader.SubMenuId === subMenuHeader.SubMenuId
          )
      );

      // Enable all checkboxes in the same group
      this.enableAllCheckboxes(subMenuIndex);
    }
    // localStorage.setItem(
    //   'selectedSubMenu',
    //   JSON.stringify(this.selectedSubMenu)
    // );
    this.calculateTotalAmount();
  }

  disableOtherCheckboxes(subMenuIndex: number, selectedHeader: any): void {
    const submenuHeaders =
      this.subMenuList[0].SubMenu[subMenuIndex].SubMenuHedaer;

    submenuHeaders.forEach((header: any) => {
      if (header.SubMenuId !== selectedHeader.SubMenuId) {
        header.disabled = true;
      }
    });
  }
  enableAllCheckboxes(subMenuIndex: number): void {
    const submenuHeaders =
      this.subMenuList[0].SubMenu[subMenuIndex].SubMenuHedaer;

    submenuHeaders.forEach((header: any) => {
      header.disabled = false;
    });
  }
  // ////////////////////////////
  calculateTotalAmount(): void {
    this.totalSubmenuAmount = this.baseAmount;
    this.selectedSubMenu.forEach((item) => {
      this.totalSubmenuAmount += item.subMenuHeader.Amount;
    });
  }
  /////////////////////////////

  submenuAddToCart(): void {
    // this.subMenuList.map((list) => {
    //   list?.SubMenu.map((item: any) => {
    //     if (item?.SubMenuHedaer !== undefined && item?.UpTo === 1) {
    //       console.log('submenu', item);
    //       this.selectedSubMenu.map((x) => {
    //         if (x.UpTo !== undefined) {
    //           console.log(x);
    //         } else {
    //           console.log('empty');
    //         }
    //       });
    //     }
    //   });
    // });

    // console.log(this.selectedSubMenu);

    if (this.selectedSubMenu.length > 0) {
      const subMenuList = this.selectedSubMenu.map((item) => {
        let matchingSubMenu = this.subMenuList[0].SubMenu.find(
          (subMenu: any) => subMenu.SubMenuId === item.subMenuId
        );
        if (matchingSubMenu) {
          // Create a deep copy of the matchingSubMenu to avoid modifying the original
          let subMenuCopy = JSON.parse(JSON.stringify(matchingSubMenu));
          subMenuCopy.SubMenuHedaer = null;
          subMenuCopy.SubMenuHedaer = [item?.subMenuHeader];
          return subMenuCopy;
        }
      });
      const mainSubMenu = this.subMenuList.map((item) => item);
      if (mainSubMenu) {
        let mainSubMenuCopy = JSON.parse(JSON.stringify(mainSubMenu));
        mainSubMenuCopy[0].SubMenu = null;
        mainSubMenuCopy[0].SubMenu = [...subMenuList];
        mainSubMenuCopy[0].Amount = this.totalSubmenuAmount;
        mainSubMenuCopy[0].TotalAmount = this.totalSubmenuAmount;
        this.cartItems.push(...mainSubMenuCopy);
        localStorage.setItem('cartList', JSON.stringify(this.cartItems));

        // -----total amount-----
        this.totalAmount = this.cartItems.reduce(
          (acc, amount) => acc + amount?.Amount,
          0
        );

        this.closeModal();
      }
    } else {
      alert('please select submenu');
    }
  }

  // -----------Modal code--------------
  closeModal() {
    this.isVisible = false;
  }
  openModal() {
    this.isVisible = true;
  }
  // -----------Quantity button--------------
  decreaseQuantity(data: any): void {
    const existingItemIndex = this.cartItems.findIndex(
      (item) => item?.MenuId === data?.MenuId
    );
    if (existingItemIndex !== -1) {
      const existingItem = this.cartItems[existingItemIndex];
      if (existingItem.Quantity > 1) {
        if (existingItem?.SubMenuId !== null) {
          existingItem.Amount -= data?.TotalAmount;
        } else if (existingItem?.DiscountAmount !== null) {
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
    if (this.isVisibleCartDetail) {
      this.router.navigate(['checkout/place-order'], {
        queryParams: this.activatedRoute.snapshot.queryParams,
      });
    } else {
      this.isVisibleCartDetail = true;
      // console.log(this.cartItems);
    }
  }

  // ////////////////////////////////////////////////////
  isScrollable = false;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const secondElement = document.querySelector('.test') as HTMLElement;
    const rect = secondElement.getBoundingClientRect();
    if (rect.top <= 37.171875) {
      this.isScrollable = true;
    } else {
      this.isScrollable = false;
    }
  }
}
