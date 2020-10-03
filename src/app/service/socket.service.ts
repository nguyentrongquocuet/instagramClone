import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import * as io from 'socket.io-client';
import { socketUrl } from 'src/config/socket';
import { UserService } from './user.service';
@Injectable({
  providedIn: 'root',
})
export class SocketService {
  io = io(socketUrl);
  private socketId;
  socketSubject: Subject<any>;
  constructor() {
    this.socketSubject = new Subject();
  }
  getSocketId() {
    return this.socketId;
  }
  listen(eventName) {
    this.io.on(eventName, (data) => {
      console.log('from socket' + eventName + data);
      this.socketSubject.next({ ...data });
    });
  }
  emit(eventName, value) {
    this.io.emit(eventName, value);
  }
  getSocketListener() {
    return this.socketSubject.asObservable();
  }
}
