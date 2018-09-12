import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../_services/auth.service';
import { AngularFireDatabase } from '@angular/fire/database';
import { database } from 'firebase/app';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  isLogin: boolean;
  path: string;
  sub: Subscription;

  constructor(
    private authService: AuthService,
    private db: AngularFireDatabase,
    private router: Router
  ) {
    this.path = '';
    if (this.authService.authenticated) {
      this.isLogin = true;
    } else {
      this.authService.loadAPI.subscribe((res: Object) => {
        if (this.authService.authenticated) {
          this.isLogin = true;
        } else {
          this.isLogin = false;
        }
      },
      error => {
        this.isLogin = false;
      });
    }
  }

  ngOnInit() {
    this.sub = this.router.events.subscribe((s) => {
      if (s instanceof NavigationEnd) {
        this.path = s.url;
      }
    });
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  logout() {
    const itemsRef = this.db.list(`/histories/${this.authService.authState.uid}`);
    itemsRef.push({
      timestamp: database.ServerValue.TIMESTAMP,
      description: `${this.authService.authState.email} is logged out.`
    }).then(() => {
      this.authService.logout();
    });
  }

}
