import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LoginComponent } from '../component/auth/login/login.component';
import { SignupComponent } from '../component/auth/signup/signup.component';
import { AuthRoutingModule } from '../router/auth-routing.module';

@NgModule({
  declarations: [LoginComponent, SignupComponent],
  imports: [CommonModule, RouterModule, ReactiveFormsModule, AuthRoutingModule],
  exports: [LoginComponent, SignupComponent],
})
export class AuthModule {}
