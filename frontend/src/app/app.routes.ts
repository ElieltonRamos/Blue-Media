import { Routes } from '@angular/router';
import { Login } from './features/login/pages/login';
import { OfflineComponent } from './shared/offline/pages/offline.component';
import { NotFound } from './shared/offline/pages/not-found';
import { AppLayout } from './shared/app-layout/app-layout';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: Login,
  },
  {
    path: 'dashboard',
    component: AppLayout,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: OfflineComponent,
      },
    ],
  },
  {
    path: 'offline',
    component: OfflineComponent,
  },
  {
    path: '**',
    component: NotFound,
  },
];
