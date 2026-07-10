import { Routes } from '@angular/router';
import { DoSign } from './page/do-sign/do-sign';

export const routes: Routes = [
  {path: '', redirectTo: 'do-sign', pathMatch: 'full'},
  {path: 'do-sign', component: DoSign, title: 'ASL translation | Hearo'},
];
