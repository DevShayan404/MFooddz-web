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
    this.getFirstName();
  }

  ngOnInit(): void {}

  getFirstName() {
    this.firstName = localStorage.getItem('firstName')!;
  }

  logout() {
    localStorage.removeItem('firstName');
    localStorage.removeItem('custId');
    this.getFirstName();
  }
}
