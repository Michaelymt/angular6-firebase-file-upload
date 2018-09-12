import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../_services/auth.service';
import { AlertService } from '../_services/alert.service';
import { AngularFireDatabase } from '@angular/fire/database';
import { database } from 'firebase/app';

@Component({templateUrl: 'login.component.html'})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  submitted = false;
  returnUrl: string;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private authService: AuthService,
    private alertService: AlertService,
    private db: AngularFireDatabase,
    private router: Router) {}

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    });

    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  // convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }

  onSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.authService.loginWithEmail(this.loginForm['value']['email'], this.loginForm['value']['password'])
      .then(res => {
        const itemsRef = this.db.list(`/histories/${this.authService.authState.uid}`);
        itemsRef.push({
          timestamp: database.ServerValue.TIMESTAMP,
          description: `${this.authService.authState.email} is logged in.`
        });
        this.router.navigate([this.returnUrl]);
      })
      .catch((error) => {
        this.alertService.error(error.message);
        this.loading = false;
      });
    
  }
}
