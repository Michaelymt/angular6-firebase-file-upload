import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { AuthService } from '../_services/auth.service';
import { AlertService } from '../_services/alert.service';
import { PasswordValidation } from '../_components/password-validation';

@Component({templateUrl: 'register.component.html'})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  loading = false;
  submitted = false;

  constructor(
    public _authService: AuthService,
    private formBuilder: FormBuilder,
    private router: Router,
    private alertService: AlertService) { }

  ngOnInit() {
    const emailRegEx = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    this.registerForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.pattern(emailRegEx)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [
        Validators.required
      ]]
    }, {validator: PasswordValidation.MatchPassword});
  }

  // convenience getter for easy access to form fields
  get f() { return this.registerForm.controls; }

  onSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;
    this._authService.emailSignUp(this.registerForm['value']['email'], this.registerForm['value']['password'])
        .then(res => {
          this.alertService.success('Registration successful', true);
          this.router.navigate(['/login']);
        })
        .catch((error) => {
          this.loading = false;
          this.alertService.error(error.message);
        });
  }
}

