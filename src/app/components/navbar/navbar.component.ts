import { Component } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  scrolled: boolean = false;
  firstName!: string | null;
  constructor() {

  }

  ngOnInit(): void {
    this.getFirstName();
  }

  getFirstName() {
    this.firstName = localStorage.getItem('firstName')!;
  }

  logout() {
    localStorage.clear();
    window.location.reload();
    // this.getFirstName();
  }
}
