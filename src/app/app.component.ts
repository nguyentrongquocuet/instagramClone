import { Component, OnInit } from '@angular/core';
import { PusherService } from './service/pusher.service';
import { UserService } from './service/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(
    private userService: UserService,
    private pusherService: PusherService
  ) {}
  title = 'InstagramClone';
  ngOnInit(): void {
    this.userService.autoAuth();
    const channel = this.pusherService.subscribeChannel('change');
    channel.bind('change', (change) => {
      console.log(change);
    });
  }
}
