import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const redirectGuardGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const previousUrl = router
    .getCurrentNavigation()
    ?.previousNavigation?.finalUrl?.toString();
  if (previousUrl?.includes('/order-tracking')) {
    router.navigate(['/'], { replaceUrl: true });
    return false;
  }
  return true;
};
