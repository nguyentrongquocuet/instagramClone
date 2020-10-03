import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { UserFullData } from '../model/userFullDataModel';
import { url } from '../../config/serverUrl';
import { UserData } from '../model/userDataModel';
import { SocketService } from './socket.service';
@Injectable({
  providedIn: 'root',
})
export class UserService {
  userData: UserFullData;
  loginStatusSubject: Subject<any>;
  server: string;
  constructor(private http: HttpClient, private router: Router) {
    this.loginStatusSubject = new Subject();
    this.server = url + 'user/';
    this.userData = this.loadSavedData();
  }

  saveUserData(data) {
    this.userData = {
      ...data,
    };
    localStorage.setItem('username', data.username);
    localStorage.setItem('name', data.name);
    localStorage.setItem('userId', data.userId);
    localStorage.setItem('token', data.token);
    localStorage.setItem('expiresIn', data.expiresIn);
    localStorage.setItem('avatarPath', data.avatarPath);
  }
  loadSavedData() {
    const username = localStorage.getItem('username');
    const name = localStorage.getItem('name');
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    const avatarPath = localStorage.getItem('avatarPath');
    const expiresIn = parseInt(localStorage.getItem('expiresIn'), 10);
    if (token) {
      return new UserFullData(
        userId,
        username,
        name,
        avatarPath,
        token,
        expiresIn
      );
    }
    return new UserFullData(null, null, null, null, null, null);
  }

  autoAuth() {
    console.log('auto auth');
    const savedData = this.loadSavedData();
    if (savedData.token) {
      this.http
        .post<{ username; userId; name; token; expiresIn; avatarPath }>(
          this.server + 'check',
          null
        )
        .subscribe(
          (responseData) => {
            this.saveUserData({ ...responseData });
            this.loginStatusSubject.next({ ...this.getUserData() });
            this.router.navigate(['/']);
          },
          (err) => {
            this.router.navigate(['/login']);
          }
        );
    } else {
      this.router.navigate(['/login']);
    }
  }
  getLoginStatusListener() {
    return this.loginStatusSubject.asObservable();
  }
  signup(data, image: File) {
    let signupData;
    if (image) {
      signupData = new FormData();
      signupData.append('username', data.username);
      signupData.append('name', data.name);
      signupData.append('password', data.password);
      signupData.append('repassword', data.repassword);
      signupData.append('image', image as File, 'avatar ' + data.username);
    } else {
      signupData = data;
    }

    this.http
      .post<{ username; userId; name; token; expiresIn; avatarPath }>(
        this.server + 'signup',
        signupData
      )
      .subscribe(
        (responseData) => {
          console.log('we sign up success');
          this.login(data.username, data.password);
        },
        () => {
          alert('cannot login');
        }
      );
  }

  login(username: string, password: string) {
    const userAuthData = {
      username: username.trim(),
      password: password.trim(),
    };
    this.http
      .post<{ username; userId; name; token; expiresIn; avatarPath }>(
        this.server + 'login',
        userAuthData
      )
      .subscribe(
        (responseData) => {
          this.saveUserData({ ...responseData });
          this.loginStatusSubject.next({ ...this.getUserData() });
          this.router.navigate(['/']);
        },
        (err) => {
          console.log('we have error');
          this.saveUserData(
            new UserFullData(null, null, null, null, null, null)
          );
        }
      );
  }
  getUserData() {
    return new UserData(
      this.userData.userId,
      this.userData.username,
      this.userData.name,
      this.userData.avatarPath
    );
  }
  getToken() {
    return this.userData.token;
  }
}
