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
  constructor(private sharingService: SharingService) {}
  ngOnInit(): void {
    this.sharingService.showFooter(false);
    this.sharingService.showNavbar(false);
  }

  handleIndexChange(e: number): void {
    console.log(e);
  }

  showOrdersSummary() {
    this.isVisibleOrderSummary = !this.isVisibleOrderSummary;
  }
}
