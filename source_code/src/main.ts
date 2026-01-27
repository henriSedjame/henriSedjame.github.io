import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from '@App/app.config';
import { App } from '@App/app';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
