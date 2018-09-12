import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuardService implements CanActivate {

  constructor(private router: Router, private authService: AuthService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (this.authService.authenticated) {
      return true;
    } else {
      const status: Promise<boolean> = new Promise((resolve, reject) => {
        this.authService.loadAPI.subscribe((res: Object) => {
          if (this.authService.authenticated) {
            resolve(true);
          } else {
            this.router.navigate(['/login'], { queryParams: { returnUrl: state.url }});
            resolve(false);
          }
        },
        error => {
          console.log(error);
          this.router.navigate(['/login'], { queryParams: { returnUrl: state.url }});
          resolve(false);
        });
      });
  
      return status;
    }
  }
}
