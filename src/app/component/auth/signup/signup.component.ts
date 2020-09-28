import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UserService } from 'src/app/service/user.service';
import { mimeType } from 'src/app/validator/mimetype.validator';
import { inputEffect } from '../effect/input-effect';

@Component({
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent implements OnInit {
  form: FormGroup;
  imagePreviewImage;
  constructor(private userService: UserService) {}
  ngOnInit(): void {
    this.form = new FormGroup({
      username: new FormControl(null, { validators: Validators.required }),
      name: new FormControl(null, { validators: Validators.required }),
      password: new FormControl(null, { validators: Validators.required }),
      repassword: new FormControl(null, { validators: Validators.required }),
      image: new FormControl(null, { asyncValidators: [mimeType] }),
    });
  }
  inputEffect() {
    inputEffect('form-field');
  }

  canSignup() {
    return (
      this.form.value.password !== this.form.value.repassword ||
      this.form.invalid
    );
  }
  signup() {
    const data = {
      username: this.form.value.username,
      name: this.form.value.name,
      password: this.form.value.password,
      repassword: this.form.value.repassword,
    };
    if (this.form.value.image) {
      this.userService.signup(data, this.form.value.image);
    } else {
      this.userService.signup(data, null);
    }
  }
  onPickedImage(e: Event) {
    const file = (e.target as HTMLInputElement).files[0];
    this.form.patchValue({ image: file });
    this.form.get('image').updateValueAndValidity();
    const fr = new FileReader();
    fr.addEventListener('loadend', () => {
      if (this.form.get('image').valid) {
        this.imagePreviewImage = fr.result as string;
      }
    });
    fr.readAsDataURL(file);
  }
  resetInput(e: Event) {
    (e.target as HTMLInputElement).value = null;
  }
}
