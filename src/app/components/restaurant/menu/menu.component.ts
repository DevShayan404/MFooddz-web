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
  selectedSubMenuList: any[] = [];
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
          this.getSelectedSubmenu();
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
  getSelectedSubmenu(): void {
    // Retrieve the stored selected submenu list from localStorage
    const savedSubMenuList = localStorage.getItem('selectedSubMenuList');
    if (savedSubMenuList) {
      this.selectedSubMenuList = JSON.parse(savedSubMenuList);
      this.calculateTotalAmount();
    }
  }

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
    // this.subMenuList = [];
    // this.selectedSubMenu = [];

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
        // this.totalSubmenuAmount = this.baseAmount;
        this.modalSkeleton = false;
        // console.log(this.subMenuList);
      },
    });
  }
  isSelected(subMenuId: number): boolean {
    return this.selectedSubMenuList[0]?.SubMenu.some(
      (subMenu: any) => subMenu.SubMenuId === subMenuId
    );
  }
  // //////////////////////////////////

  onSubMenuHeaderSelect(
    subMenuIndex: number,
    menu: any,
    subMenuHeader: any,
    subMenu: any
  ): void {
    if (this.selectedSubMenuList.length <= 0) {
      const newObj = {
        MenuId: menu.MenuId,
        Name: menu.Name,
        Description: menu.Description,
        ImageHeader: menu.ImageHeader,
        ImageIcon: menu.ImageIcon,
        BaseAmount: menu.BaseAmount,
        DiscountAmount: menu.DiscountAmount,
        SubMenuItemCount: menu.SubMenuItemCount,
        SubMenuId: menu.SubMenuId,
        Quantity: menu.Quantity,
        Amount: menu.Amount,
        TotalAmount: menu.TotalAmount,
        SubMenu: [
          {
            MenuId: subMenu.MenuId,
            SubMenuId: subMenu.SubMenuId,
            Name: subMenu.Name,
            Description: subMenu.Description,
            Amount: subMenu.Amount,
            IsParent: subMenu.IsParent,
            UpTo: subMenu.UpTo,
            SelectorNumber: subMenu.SelectorNumber,
            MinQuantity: subMenu.MinQuantity,
            MaxQuantity: subMenu.MaxQuantity,
            SubMenuHedaer: [subMenuHeader],
          },
        ],
      };
      this.selectedSubMenuList.push(newObj);
    } else {
      const subMenuHeaderIndex = this.selectedSubMenuList[0].SubMenu.flatMap(
        (list: any) => list.SubMenuHedaer
      ).findIndex(
        (element: any) => element.SubMenuId === subMenuHeader.SubMenuId
      );

      if (subMenuHeaderIndex !== -1) {
        this.selectedSubMenuList[0].SubMenu.splice(subMenuHeaderIndex, 1);
      } else {
        const subMenuIndex = this.selectedSubMenuList[0].SubMenu.findIndex(
          (element: any) => element.SubMenuId === subMenu.SubMenuId
        );
        if (subMenuIndex !== -1) {
          this.selectedSubMenuList[0].SubMenu[subMenuIndex] = {
            MenuId: subMenu.MenuId,
            SubMenuId: subMenu.SubMenuId,
            Name: subMenu.Name,
            Description: subMenu.Description,
            Amount: subMenu.Amount,
            IsParent: subMenu.IsParent,
            UpTo: subMenu.UpTo,
            SelectorNumber: subMenu.SelectorNumber,
            MinQuantity: subMenu.MinQuantity,
            MaxQuantity: subMenu.MaxQuantity,
            SubMenuHedaer: [subMenuHeader],
          };
        } else {
          this.selectedSubMenuList[0].SubMenu.push({
            MenuId: subMenu.MenuId,
            SubMenuId: subMenu.SubMenuId,
            Name: subMenu.Name,
            Description: subMenu.Description,
            Amount: subMenu.Amount,
            IsParent: subMenu.IsParent,
            UpTo: subMenu.UpTo,
            SelectorNumber: subMenu.SelectorNumber,
            MinQuantity: subMenu.MinQuantity,
            MaxQuantity: subMenu.MaxQuantity,
            SubMenuHedaer: [subMenuHeader],
          });
        }
      }
      this.calculateTotalAmount();
    }
    // Save the current state to localStorage
    localStorage.setItem(
      'selectedSubMenuList',
      JSON.stringify(this.selectedSubMenuList)
    );
  }

  // ////////////////////////////
  calculateTotalAmount(): void {
    this.totalSubmenuAmount = this.baseAmount;
    this.selectedSubMenuList.map((list) => {
      list.SubMenu.map((element: any) => {
        element.SubMenuHedaer.map((amount: any) => {
          this.totalSubmenuAmount += amount.Amount;
        });
      });
    });
  }
  /////////////////////////////

  submenuAddToCart(): void {
    if (this.selectedSubMenuList.length > 0) {
      this.selectedSubMenuList.forEach((element) => {
        if (element) {
          element.Amount = this.totalSubmenuAmount;
          element.TotalAmount = this.totalSubmenuAmount;
        }
        this.cartItems.push(element);
        localStorage.setItem('cartList', JSON.stringify(this.cartItems));
        // -----total amount-----
        this.totalAmount = this.cartItems.reduce(
          (acc, amount) => acc + amount?.Amount,
          0
        );
        // this.selectedSubMenuList = [];
        this.closeModal();
      });
    } else {
      console.log('not');
    }

    console.log(this.cartItems);
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

// disableOtherCheckboxes(subMenuIndex: number, selectedHeader: any): void {
//   const submenuHeaders =
//     this.subMenuList[0].SubMenu[subMenuIndex].SubMenuHedaer;

//   submenuHeaders.forEach((header: any) => {
//     if (header.SubMenuId !== selectedHeader.SubMenuId) {
//       header.disabled = true;
//     }
//   });
// }
// enableAllCheckboxes(subMenuIndex: number): void {
//   const submenuHeaders =
//     this.subMenuList[0].SubMenu[subMenuIndex].SubMenuHedaer;

//   submenuHeaders.forEach((header: any) => {
//     header.disabled = false;
//   });
// }
