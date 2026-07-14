import { Routes } from '@angular/router';
import { DoSign } from './page/do-sign/do-sign';
import { PageNotFound } from './page/page-not-found/page-not-found';
import { Clerk } from './page/clerk/clerk';

export const routes: Routes = [
  {path: '', redirectTo: 'do-sign', pathMatch: 'full'},
  {path: 'do-sign', component: DoSign, title: 'ASL translation | Hearo'},
  {path: 'clerk', component: Clerk, title: 'Clerk Messages | Hearo'},

  {path: '**', component: PageNotFound, title: 'Hearo - Page Not Found'},
];
