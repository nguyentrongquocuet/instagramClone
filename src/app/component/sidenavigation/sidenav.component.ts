import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { UserData } from 'src/app/model/userDataModel';
import { UserService } from 'src/app/service/user.service';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
})
export class SidenavComponent implements OnInit, OnDestroy {
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
        console.log(userData);
        this.userData = userData;
      });
  }
  ngOnDestroy(): void {
    this.loginStatusSub.unsubscribe();
  }
}
