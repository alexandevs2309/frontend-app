import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app.config';
import { AppComponent } from './app.component';
import {registerLocaleData} from '@angular/common';
import localeEsDO from '@angular/common/locales/es-DO';

registerLocaleData(localeEsDO);

bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));
