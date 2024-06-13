import { ChangeDetectorRef, Component } from '@angular/core';
import { SharingService } from './core/sharing-service/sharing.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'MFoodz-web-17';
  isNavbarVisible!: boolean;
  isFooterVisible!: boolean;

  constructor(
    private sharingService: SharingService,
    private cdr: ChangeDetectorRef
  ) {}
  ngOnInit(): void {

    this.getTimeZone();
    this.sharingService
      .getNavbarVisibility()
      .subscribe((isVisible: boolean) => {
        this.isNavbarVisible = isVisible;
        this.cdr.detectChanges();
      });
    this.sharingService.getFooterVisibility().subscribe((isVisible: any) => {
      this.isFooterVisible = isVisible;
      this.cdr.detectChanges();
    });
  }

  getTimeZone() {
    const timeZone = new Date().getTimezoneOffset();
    const timeZoneInHours = (timeZone / 60) * -1;
    if (timeZoneInHours === 5) {
      this.sharingService.setCountry('PK');
      console.log('PK');
    } else {
      this.sharingService.setCountry('CA');
      console.log('CA');
    }
  }
}
