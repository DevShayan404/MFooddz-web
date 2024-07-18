import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.error(err))
  .then(() => {
    const body = document.querySelector('body');
    if (body) {
      body.classList.add('app-loaded');
    }
  });
