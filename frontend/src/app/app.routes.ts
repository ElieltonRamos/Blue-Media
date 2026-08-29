import { Routes } from '@angular/router';
import { Login } from './features/login/pages/login';
import { OfflineComponent } from './shared/offline/pages/offline.component';
import { NotFound } from './shared/offline/pages/not-found';
import { AppLayout } from './shared/app-layout/app-layout';
import { authGuard } from './core/guards/auth.guard';
import { Dashboard } from './features/dashboard/pages/dashboard';
import { Clients } from './features/clients/pages/clients';
import { Categories } from './features/category/pages/categories';
import { Users } from './features/users/pages/users';
import { Reports } from './features/reports/pages/reports';

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
        component: Dashboard,
      },
      {
        path: 'clientes',
        component: Clients,
      },
      {
        path: 'categorias',
        component: Categories,
      },
      {
        path: 'usuarios',
        component: Users,
      },
      {
        path: 'relatorios',
        component: Reports,
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
