import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import Pusher from 'pusher-js';
@Injectable({
  providedIn: 'root',
})
export class PusherService {
  pusher: Pusher;
  constructor(private http: HttpClient) {
    const API_KEY = 'd728fc554a38ef50d3f8';
    this.pusher = new Pusher(API_KEY, {
      cluster: 'ap1',
      authEndpoint: 'http://localhost:3000/pusher/auth',
    });
  }
  subscribeChannel(channelName) {
    return this.pusher.subscribe(channelName);
  }
  subscribePrivateChannel(channelName, userId) {
    return new Pusher('d728fc554a38ef50d3f8', {
      cluster: 'ap1',
      authEndpoint: `http://localhost:3000/pusher/auth`,
      authTransport: 'jsonp',
    }).subscribe(channelName);
  }
}
