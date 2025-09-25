import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { AuthService } from './app/core/services/auth.service';
import { installAxiosInterceptors } from './app/core/interceptors/auth.interceptor';

bootstrapApplication(AppComponent, { providers: [provideRouter(routes), AuthService] })
  .then(ref => {
    const injector = (ref as any)._injector;
    const auth = injector.get(AuthService);
    installAxiosInterceptors(auth);
  })
  .catch(console.error);
