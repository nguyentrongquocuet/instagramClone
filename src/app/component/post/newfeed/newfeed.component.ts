import { HttpClient } from '@angular/common/http';
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
  likedUserData: { postId; userData: UserData[] };
  loginStatusSub: Subscription;
  posts: Post[] = [];
  fetching = true;
  part = 0;
  postPerPart = 3;
  totalSize = 0;
  postWithFullComment: Post;
  channel;
  postIds = [];
  constructor(
    private userService: UserService,
    private postService: PostService,
    private socketService: SocketService,
    private http: HttpClient
  ) {
    this.loginStatusSub = new Subscription();
    this.userData = this.userService.getUserData();
  }
  ngOnInit(): void {
    this.userData = this.userService.getUserData();
    this.loginStatusSub = this.userService
      .getLoginStatusListener()
      .subscribe((userData) => {
        this.userData = userData;
      });
    this.postService.getPostSubjectListener().subscribe((postData) => {
      this.fetching = false;
      if ('totalSize' in postData) {
        this.totalSize = postData.totalSize;
        // this.posts.push(...this.mapPost(postData.posts));
        // console.log(this.posts);
      }
    });
    this.socketService.emit('auth', this.userData.userId);
    this.socketService.listen('post');
    this.socketService.listen('socketId');
    this.socketService.getSocketListener().subscribe((data) => {
      console.log(data);
      switch (data.operation) {
        case 'addpost':
          this.posts.unshift(this.mapOnePost(data.post));
          break;
        case 'getonepost':
          this.totalSize = data.totalSize;
          this.posts.push(this.mapOnePost(data.post));
          break;
        case 'getlike':
          console.log('getlikeeeee ', data);
          this.likedUserData.userData.push(data.userData);
          break;
        case 'addlike':
          this.updateLike(1, data.postId, data.userId);
          break;
        case 'unlike':
          this.updateLike(-1, data.postId, data.userId);
          if (this.likedUserData && this.likedUserData.postId === data.postId) {
            this.getLikedUserList(data.postId);
          }
          break;
        case 'addcomment':
          this.updateComment(data.postId, data.comment, data.userData);
          break;
        case undefined:
          this.postService.getPost(this.part, this.postPerPart);
          break;
        default:
          break;
      }
    });
  }
  testSocket() {
    this.http.get('http://localhost:3000/api/p0st/like').subscribe((r) => {
      console.log(r);
    });
  }
  addComment(post: Post, input: HTMLInputElement) {
    if (input.value.trim().length > 0) {
      this.postService
        .addComment(post._id, input.value.trim())
        .subscribe(() => {
          input.value = '';
        });
    }
  }
  ngOnDestroy(): void {
    this.loginStatusSub.unsubscribe();
  }
  typing(e: Event) {
    // this.socketService.emit('typing', null);
  }
  like(post: Post) {
    console.log('from like ', post);
    this.postService.like(post._id);
  }
  // init liked for raw post with likedList=["id1", "id2"]
  initLiked(post: any) {
    for (const id of post.likeList) {
      if (id === this.userData.userId) {
        return true;
      }
    }
    return false;
  }
  // Update like, comment was separated
  updateLike(increase: number, postId, userId) {
    for (let i = 0; i < this.posts.length; i++) {
      if (this.posts[i]._id === postId) {
        this.posts[i].likecount += increase;
        if (increase > 0) {
          if (this.userData.userId === userId) {
            this.posts[i].isLiked = true;
          }
          this.posts[i].likeList.push({ userId, userData: null });
        } else {
          this.posts[i].likeList.splice(
            this.contain('userId', userId, this.posts[i].likeList),
            1
          );
          if (this.userData.userId === userId) {
            this.posts[i].isLiked = false;
          }
        }
        console.log(this.posts[i]);
      }
    }
  }
  getLikedUserList(postId) {
    this.likedUserData = { postId, userData: [] };
    this.postService.getLikedUserList(postId).subscribe((likedUserData) => {
      // this.likedUserData = { postId: post._id, userData: likedUserData };
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
      if ((this.part + 1) * this.postPerPart < this.totalSize) {
        this.fetching = true;
        this.part++;
        console.log('get more post');
        this.postService.getPost(this.part, this.postPerPart);
      }
    }
  }
  getPostWithFullComment(post: Post) {
    this.postWithFullComment = post;
    post = null;
    console.log(this.postWithFullComment);
  }
  // updatePostWithFullComment(post: Post) {
  //   if (post && this.postWithFullComment) {
  //     this.postWithFullComment.isLiked = post.isLiked;
  //     this.postWithFullComment.liked = post.liked;
  //     if (
  //       this.postWithFullComment.commentList.totalComment !==
  //       post.commentList.totalComment
  //     ) {
  //       this.getPostWithFullComment(post._id);
  //     }
  //   }
  // }
  // updateLikedUserData(post: Post) {
  //   if (
  //     this.likedUserData &&
  //     this.likedUserData.postId === post._id &&
  //     this.likedUserData.userData.length !== post.liked
  //   ) {
  //     this.getLikedUserList(post);
  //   }
  // }

  updateComment(postId, comment, userData: UserData) {
    console.log(postId, userData, comment);
    for (let i = 0; i < this.posts.length; i++) {
      if (this.posts[i]._id === postId) {
        this.posts[i].commentList.push({
          userId: userData.userId,
          comment,
          userData,
        });
        this.posts[i].commentcount += 1;
      }
    }
  }
  // map raw posts to model
  mapPost(postData: any) {
    if (Array.isArray(postData)) {
      return postData.map((p) => {
        return this.mapOnePost(p);
      });
    } else {
      return this.mapOnePost(postData);
    }
  }
  // map raw post to model
  mapOnePost(post: any) {
    const finalLikeList = post.likeList.map((l) => {
      return { userId: l, userData: null };
    });
    console.log('da like: ' + this.initLiked(post));
    return {
      ...post,
      likeList: finalLikeList,
      isLiked: this.initLiked(post),
    };
  }
  contain(key, value, array: Array<any>) {
    for (const index in array) {
      if (array[index][key] === value) {
        return parseInt(index);
      }
    }
    return -1;
  }
}
