import { UserData } from './userDataModel';

export class Post {
  _id: string;
  imagePath: string;
  title: string;
  isLiked: boolean;
  creatorId: string;
  creator: UserData;
  likeList: [{ userId: string; userData: UserData }];
  commentList: [{ userId: string; userData: UserData; comment: string }];
  likecount: number;
  commentcount: number;
}
