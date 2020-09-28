import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Post } from 'src/app/model/postModel';
import { UserData } from 'src/app/model/userDataModel';
import { PostService } from 'src/app/service/post.service';
import { SocketService } from 'src/app/service/socket.service';
import { UserService } from 'src/app/service/user.service';

@Component({
  selector: 'app-newfeed',
  templateUrl: './newfeed.component.html',
  styleUrls: ['./newfeed.component.scss'],
})
export class NewfeedComponent implements OnInit, OnDestroy {
  userData: UserData;
  likedUserData: UserData[];
  loginStatusSub: Subscription;
  posts: Post[] = [];
  fetching = true;
  part = 0;
  postPerPart = 3;
  totalSize = 0;
  constructor(
    private userService: UserService,
    private postService: PostService,
    private socketService: SocketService
  ) {
    this.loginStatusSub = new Subscription();
    this.userData = this.userService.getUserData();
  }
  ngOnInit(): void {
    this.userData = this.userService.getUserData();
    this.socketService.getSocketListener().subscribe((changeData) => {
      console.log(changeData);
      this.fetching = false;
      if (changeData.operation === 'add') {
        this.postService.getOnePost(changeData.postId).subscribe((post) => {
          this.posts.unshift(post);
        });
      } else if (changeData.operation === 'update') {
        this.postService.getOnePost(changeData.postId).subscribe((post) => {
          this.updatePost(this.posts, post);
        });
      }
    });
    this.socketService.listen('postchange');
    this.loginStatusSub = this.userService
      .getLoginStatusListener()
      .subscribe((userData) => {
        this.userData = userData;
      });
    this.postService.getPostSubjectListener().subscribe((postData) => {
      this.fetching = false;
      if ('totalSize' in postData) {
        this.totalSize = postData.totalSize;
        this.posts.push(...postData.posts);
        console.log(this.posts);
      } else {
        this.updatePost(this.posts, postData as Post);
      }
    });
    this.postService.getPost(this.part, this.postPerPart);
  }
  ngOnDestroy(): void {
    this.loginStatusSub.unsubscribe();
  }
  doNothing(e: Event) {}
  like(post: Post) {
    this.updatePost(this.posts, { ...post, isLiked: !post.isLiked });
    this.postService.like(post._id);
  }
  updatePost(posts: Post[], newPost: Post) {
    if (newPost) {
      for (let i = 0; i < posts.length; i++) {
        if (posts[i]._id === newPost._id) {
          posts[i] = newPost;
        }
      }
    }
  }
  getLikedUserList(post: Post) {
    this.postService.getLikedUserList(post._id).subscribe((likedUserData) => {
      this.likedUserData = likedUserData;
      console.log(this.likedUserData);
    });
  }
  scroll() {
    if (
      document.documentElement.scrollTop /
        (document.documentElement.scrollHeight -
          document.documentElement.clientHeight) >=
        0.4 &&
      !this.fetching
    ) {
      console.log('getting post again');
      if ((this.part + 1) * this.postPerPart < this.totalSize) {
        this.fetching = true;
        this.part++;
        this.postService.getPost(this.part, this.postPerPart);
      }
    }
  }
}
