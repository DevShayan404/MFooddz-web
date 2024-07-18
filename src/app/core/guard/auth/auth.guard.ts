import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  const _router = inject(Router);
  let isLoggedIn = localStorage.getItem('firstName')!;
  if (isLoggedIn) {
    _router.navigate(['/']);
    return false;
  } else {
    return true;
  }
};
