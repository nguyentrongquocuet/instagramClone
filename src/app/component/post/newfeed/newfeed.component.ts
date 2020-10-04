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
          this.updateComment(
            1,
            data.postId,
            data.id,
            data.comment,
            data.userData
          );
          if (
            this.postWithFullComment &&
            this.postWithFullComment._id === data.postId
          ) {
            this.postWithFullComment.commentcount += 1;
            this.postWithFullComment.commentList.push({
              id: data.id,
              userId: data.userId,
              comment: data.comment,
              userData: data.userData,
            });
          }
          break;
        case 'deletecomment':
          this.updateComment(
            -1,
            data.postId,
            data.id,
            data.comment,
            data.userData
          );
          if (
            this.postWithFullComment &&
            this.postWithFullComment._id === data.postId
          ) {
            this.postWithFullComment.commentcount -= 1;
            for (
              let j = 0;
              j < this.postWithFullComment.commentList.length;
              j++
            ) {
              if (this.postWithFullComment.commentList[j].id === data.id) {
                this.postWithFullComment.commentList.splice(j, 1);
                this.postWithFullComment.commentcount -= 1;
              }
            }
          }
          break;
        case 'morecomment':
          if (this.postWithFullComment) {
            this.postWithFullComment.commentList.unshift(data.comment);
          }
          break;
        case undefined:
          this.postService.getPost(this.part, this.postPerPart);
          break;
        default:
          break;
      }
    });
  }
  deleteComment(postId, comment) {
    this.postService.deleteComment(postId, comment.comment, comment.id);
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
        if (
          this.postWithFullComment &&
          postId === this.postWithFullComment._id
        ) {
          this.postWithFullComment.isLiked = this.posts[i].isLiked;
          this.postWithFullComment.likeList = this.posts[i].likeList;
          this.postWithFullComment.likecount = this.posts[i].likecount;
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
    this.postWithFullComment = { ...post, commentList: [] };
    this.postService.getMoreComments(post._id);
    console.log(this.postWithFullComment.commentList === post.commentList);
  }

  updateComment(increase, postId, id, comment, userData: UserData) {
    console.log(postId, userData, comment);

    for (let i = 0; i < this.posts.length; i++) {
      if (this.posts[i]._id === postId) {
        if (increase > 0) {
          const newComment = {
            id,
            userId: userData.userId,
            comment,
            userData,
          };
          this.posts[i].commentList.push(newComment);
          this.posts[i].commentcount += 1;
        } else {
          for (let j = 0; j < this.posts[i].commentList.length; j++) {
            if (this.posts[i].commentList[j].id === id) {
              this.posts[i].commentList.splice(j, 1);
              this.posts[i].commentcount -= 1;
            }
          }
        }
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
