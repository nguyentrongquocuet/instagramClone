import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import * as io from 'socket.io-client';
import { socketUrl } from 'src/config/socket';
@Injectable({
  providedIn: 'root',
})
export class SocketService {
  socket: any;
  socketSubject: Subject<any>;
  constructor() {
    this.socketSubject = new Subject();
    this.socket = io(socketUrl);
  }
  listen(eventName) {
    this.socket.on(eventName, (data) => {
      this.socketSubject.next({ ...data });
    });
  }
  getSocketListener() {
    return this.socketSubject.asObservable();
  }
}
