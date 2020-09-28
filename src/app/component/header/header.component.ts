import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { UserData } from 'src/app/model/userDataModel';
import { UserService } from 'src/app/service/user.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  userData: UserData;
  loginStatusSub: Subscription;
  constructor(private userService: UserService) {
    this.loginStatusSub = new Subscription();
    this.userData = this.userService.getUserData();
  }

  ngOnInit(): void {
    this.loginStatusSub = this.userService
      .getLoginStatusListener()
      .subscribe((userData) => {
        this.userData = userData;
      });
  }
  ngOnDestroy(): void {
    this.loginStatusSub.unsubscribe();
  }
  showUserNav() {
    console.log('toggle');
    const userNav = document.getElementsByClassName('user-nav')[0];
    console.log(userNav);
    userNav.classList.toggle('display');
  }
}
