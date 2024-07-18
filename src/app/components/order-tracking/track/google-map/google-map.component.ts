import { Component, Input, SimpleChanges, ViewChild } from '@angular/core';
import { GoogleMap } from '@angular/google-maps';

@Component({
  selector: 'app-google-map',
  templateUrl: './google-map.component.html',
  styleUrl: './google-map.component.css',
})
export class GoogleMapComponent {
  @ViewChild(GoogleMap) map!: GoogleMap;
  @Input() trackingData!: any;

  driverDetail!: any[];
  trackingDetail!: any[];

  pickupIcon = {
    url: 'assets/icons/pick.png',
    scaledSize: new google.maps.Size(40, 40),
  };

  dropoffIcon = {
    url: 'assets/icons/drop.png',
    scaledSize: new google.maps.Size(40, 40),
  };

  driverIcon: any;

  mapOptions: google.maps.MapOptions = {
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    draggable: false,
    mapTypeControl: false,
    zoomControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    zoom: 14, // Initial zoom level
  };

  pickupCoordinates = { lat: 0, lng: 0 };
  dropoffCoordinates: { lat: number; lng: number } | null = null;
  driverCoordinates: { lat: number; lng: number } | null = null;
  polylineOptions: google.maps.PolylineOptions | null = null;

  mapCenter = {
    lat: this.pickupCoordinates.lat,
    lng: this.pickupCoordinates.lng,
  };

  pickupMarkerOptions: google.maps.MarkerOptions = {
    position: this.pickupCoordinates,
    icon: this.pickupIcon,
  };
  dropoffMarkerOptions: google.maps.MarkerOptions | null = null;
  driverMarkerOptions: google.maps.MarkerOptions | null = null;

  constructor() {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['trackingData'] && changes['trackingData'].currentValue) {
      this.pickUp(this.trackingData);
      this.dropOff(this.trackingData);
    }
  }

  ngAfterViewInit(): void {
    this.adjustMapBounds();
  }

  isValidCoordinate(coord: any): boolean {
    return !isNaN(coord) && coord !== null && coord !== undefined;
  }

  pickUp(data: any) {
    if (
      this.isValidCoordinate(data[0]?.PickupLat) &&
      this.isValidCoordinate(data[0]?.PickupLong)
    ) {
      this.pickupCoordinates = {
        lat: +data[0]?.PickupLat,
        lng: +data[0]?.PickupLong,
      };
      this.mapCenter = {
        lat: this.pickupCoordinates.lat,
        lng: this.pickupCoordinates.lng,
      };
      this.pickupMarkerOptions = {
        position: this.pickupCoordinates,
        icon: this.pickupIcon,
      };
    } else {
      console.error('Invalid pickup coordinates:', data);
    }
  }

  dropOff(data: any) {
    if (
      this.isValidCoordinate(data[0]?.DropoffLat) &&
      this.isValidCoordinate(data[0]?.DropoffLong)
    ) {
      this.dropoffCoordinates = {
        lat: +data[0]?.DropoffLat,
        lng: +data[0]?.DropoffLong,
      };
      this.mapCenter = {
        lat: (this.pickupCoordinates.lat + this.dropoffCoordinates.lat) / 2,
        lng: (this.pickupCoordinates.lng + this.dropoffCoordinates.lng) / 2,
      };
      this.dropoffMarkerOptions = {
        position: this.dropoffCoordinates,
        icon: this.dropoffIcon,
      };

      // Create the polyline options with a curved path
      this.polylineOptions = {
        path: this.calculateArcPath(
          this.pickupCoordinates,
          this.dropoffCoordinates
        ),
        geodesic: true,
        strokeColor: '#f26c2a',
        strokeOpacity: 1.0,
        strokeWeight: 4,
      };
    } else {
      console.error('Invalid dropoff coordinates:', data);
    }
  }

  adjustMapBounds() {
    if (this.dropoffCoordinates) {
      const bounds = new google.maps.LatLngBounds();
      bounds.extend(this.pickupCoordinates);
      bounds.extend(this.dropoffCoordinates);

      this.map.googleMap?.fitBounds(bounds);

      // Set a slight delay to adjust the zoom after bounds are fitted
      setTimeout(() => {
        const currentZoom = this.map.googleMap?.getZoom() ?? 18;
        this.map.googleMap?.setZoom(currentZoom);
      }, 1000);
    }
  }

  calculateArcPath(
    start: google.maps.LatLngLiteral,
    end: google.maps.LatLngLiteral
  ): google.maps.LatLngLiteral[] {
    const arcPoints = [];
    const numberOfPoints = 2000; // Adjust for smoother curve

    const deltaLat = end.lat - start.lat;
    const deltaLng = end.lng - start.lng;
    const arcHeight = 0.003; // Adjust the height for less curvature

    for (let i = 0; i <= numberOfPoints; i++) {
      const fraction = i / numberOfPoints;
      const lat =
        start.lat +
        deltaLat * fraction +
        Math.sin(fraction * Math.PI) * arcHeight;
      const lng = start.lng + deltaLng * fraction;
      arcPoints.push({ lat, lng });
    }

    return arcPoints;
  }
}
