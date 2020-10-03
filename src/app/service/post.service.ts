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
  getPostSubject: Subject<{ posts: Post[]; totalSize }>;
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
  like(postId) {
    this.http.post(this.server + 'like', { postId }).subscribe((res) => {
      console.log('res');
      // this.getOnePost(postId, 2);
    });
  }
  addComment(postId, comment) {
    return this.http.post(this.server + 'comment', { postId, comment });
  }
  getPost(part, postPerPart) {
    console.log('serve');
    this.http
      .get<{ posts: Post[]; totalSize }>(
        this.server + `?part=${part}&postPerPart=${postPerPart}`
      )
      .subscribe((postData) => {
        this.getPostSubject.next(postData);
      });
  }
  getOnePost(id, commentLimit) {
    return this.http.get<Post>(
      this.server + `${id}?commentLimit=${commentLimit}`
    );
  }
  getPostSubjectListener() {
    return this.getPostSubject.asObservable();
  }

  getLikedUserList(postId) {
    return this.http.get<UserData[]>(this.server + `like/${postId}`);
  }
}
