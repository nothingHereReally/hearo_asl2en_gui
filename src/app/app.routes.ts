import { Routes } from '@angular/router';
import { DoSign } from './page/do-sign/do-sign';
import { PageNotFound } from './page/page-not-found/page-not-found';

export const routes: Routes = [
  {path: '', redirectTo: 'do-sign', pathMatch: 'full'},
  {path: 'do-sign', component: DoSign, title: 'ASL translation | Hearo'},

  {path: '**', component: PageNotFound, title: 'Hearo - Page Not Found'},
];
