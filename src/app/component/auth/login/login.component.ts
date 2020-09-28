import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UserService } from 'src/app/service/user.service';
import { imageShow } from '../effect/image-effect';
import { inputEffect } from '../effect/input-effect';
@Component({
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  form: FormGroup;
  constructor(private userService: UserService) {}
  ngOnInit(): void {
    imageShow('demo');
    this.form = new FormGroup({
      username: new FormControl(null, { validators: Validators.required }),
      password: new FormControl(null, { validators: Validators.required }),
    });
  }
  inputEffect() {
    inputEffect('form-field');
  }
  canLogin() {
    return this.form.valid;
  }
  login() {
    if (this.form.valid) {
      this.userService.login(
        this.form.value.username,
        this.form.value.password
      );
    }
  }
}
