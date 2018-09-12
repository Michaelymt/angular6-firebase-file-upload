import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';

@Injectable()
export class AuthService {
  authState: any = null;
  loadAPI: Subject<any>;

  constructor(
    public afAuth: AngularFireAuth,
    private router: Router
  ) {
    this.loadAPI = new Subject();
    this.afAuth.authState.subscribe((auth) => {
      if (auth) {
        this.authState = auth;
      } else {
        this.router.navigate(['/login']);
      }
      this.loadAPI.next();
    });
  }

  // Returns true if user is logged in
  get authenticated(): boolean {
    return this.authState !== null;
  }

  //// Email/Password Auth ////
  emailSignUp(email:string, password:string) {
    return this.afAuth.auth.createUserWithEmailAndPassword(email, password)
      .then((user) => {
        this.authState = user;
        this.loadAPI.next();
      })
      .catch(error => {
        console.log(error);
        throw error;
      });
  }

  loginWithEmail(email: string, password: string) {
    return this.afAuth.auth.signInWithEmailAndPassword(email, password)
      .then((res) => {
        this.authState = res.user;
        this.loadAPI.next();
      })
      .catch(error => {
        console.log(error);
        throw error;
      });
  }

  logout() {
    this.authState = null;
    this.afAuth.auth.signOut();
  }
}
