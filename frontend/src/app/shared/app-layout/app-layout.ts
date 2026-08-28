import { Component, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';

export interface NavItem {
  label: string;
  title: string;
  route: string;
  icon: string;
  roles: string[];
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './app-layout.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppLayout implements OnInit {
  isDark = signal(localStorage.getItem('theme') !== 'light');
  currentRouteTitle = signal('Dashboard');
  currentUser = signal({ initials: '', name: '', role: '' });

  mainNav: NavItem[] = [
    {
      label: 'Dashboard',
      title: 'Dashboard',
      route: '/dashboard',
      icon: 'grid',
      roles: ['admin', 'operator'],
    },
    {
      label: 'Clients',
      title: 'Clients',
      route: '/dashboard/clients',
      icon: 'building',
      roles: ['admin', 'operator'],
    },
    {
      label: 'Totems',
      title: 'Totems',
      route: '/dashboard/totems',
      icon: 'monitor',
      roles: ['admin', 'operator'],
    },
    {
      label: 'Media',
      title: 'Media',
      route: '/dashboard/media',
      icon: 'image',
      roles: ['admin', 'operator'],
    },
    {
      label: 'Users',
      title: 'Users',
      route: '/dashboard/users',
      icon: 'users',
      roles: ['admin', 'operator'],
    },
    {
      label: 'Reports',
      title: 'Reports',
      route: '/dashboard/reports',
      icon: 'bar-chart',
      roles: ['admin', 'operator'],
    },
  ];

  private allNav = [...this.mainNav];

  get filteredNav(): NavItem[] {
    const role = this.auth.getTokenPayload()?.role ?? '';
    return this.mainNav.filter((item) => item.roles.includes(role));
  }

  constructor(
    private router: Router,
    private auth: AuthService,
  ) {
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe((e: any) => {
      const url = e.urlAfterRedirects;
      const match = this.allNav
        .sort((a, b) => b.route.length - a.route.length)
        .find((item) => url.startsWith(item.route));
      this.currentRouteTitle.set(match?.title ?? '');
    });
  }

  ngOnInit(): void {
    document.documentElement.classList.toggle('light', !this.isDark());
    const payload = this.auth.getTokenPayload();
    if (payload) {
      this.currentUser.set({
        name: payload.username,
        role: payload.role ?? '',
        initials: payload.username.slice(0, 2).toUpperCase(),
      });
    }
  }

  toggleTheme(): void {
    this.isDark.update((v) => !v);
    document.documentElement.classList.toggle('light', !this.isDark());
    localStorage.setItem('theme', this.isDark() ? 'dark' : 'light');
  }

  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/']);
  }
}
