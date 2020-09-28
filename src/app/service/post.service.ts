import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { url } from '../../config/serverUrl';
import { Post } from '../model/postModel';
import { Subject } from 'rxjs';
import { UserData } from '../model/userDataModel';
@Injectable({
  providedIn: 'root',
})
export class PostService {
  server: string;
  getPostSubject: Subject<Post | { posts: Post[]; totalSize }>;
  constructor(private http: HttpClient) {
    this.server = url + 'post/';
    this.getPostSubject = new Subject();
  }
  addPost(title, image: File) {
    const post = new FormData();
    post.append('title', title);
    if (image) {
      post.append('image', image, File.name);
    }
    return this.http.post(this.server, post);
  }
  getPost(part, postPerPart) {
    this.http
      .get<{ posts: Post[]; totalSize }>(
        this.server + `?part=${part}&postPerPart=${postPerPart}`
      )
      .subscribe((postData) => {
        this.getPostSubject.next(postData);
      });
  }
  getOnePost(id) {
    return this.http.get<Post>(this.server + `${id}`);
  }
  getPostSubjectListener() {
    return this.getPostSubject.asObservable();
  }
  like(postId) {
    this.http
      .post(this.server + 'like', { postId })
      .subscribe((res) => this.getOnePost(postId));
  }
  getLikedUserList(id) {
    return this.http.get<UserData[]>(this.server + `like/${id}`);
  }
}
