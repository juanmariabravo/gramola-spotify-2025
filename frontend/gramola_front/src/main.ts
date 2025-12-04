import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { authInterceptor } from './app/auth.interceptor';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
  appConfig.providers = [
    ...(appConfig.providers || []),
    provideHttpClient(withInterceptors([authInterceptor])),
  ];