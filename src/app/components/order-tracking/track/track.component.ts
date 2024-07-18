import { ChangeDetectorRef, Component } from '@angular/core';
import { TrackService } from '../service/track.service';
import { SharingService } from '../../../core/sharing-service/sharing.service';

@Component({
  selector: 'app-track',
  templateUrl: './track.component.html',
  styleUrl: './track.component.css',
})
export class TrackComponent {
  trackingData!: any[];
  orderDetail!: any[];
  currentStep: number = 1;
  constructor(
    private service: TrackService,
    private sharingService: SharingService,
    private cdr: ChangeDetectorRef
  ) {}
  ngOnInit(): void {
    this.sharingService.showFooter(false);
    this.sharingService.showNavbar(true);
    this.getTrackingData();
  }
  getTrackingData() {
    this.service.getOrderHistory().subscribe({
      next: (res) => {
        // console.log(JSON.parse(res?.Result?.Data)?.Orders[0]?.ActiveOrders[0]);
        this.trackingData = [
          JSON.parse(res?.Result?.Data)?.Orders[0]?.ActiveOrders[0],
        ];
        const detail = this.trackingData[0]?.OrderDetailsNew;
        this.orderDetail = JSON.parse(detail)?.OrderDetails;
        // console.log(this.orderDetail);
        this.cdr.detectChanges();
      },
    });
  }
}
