import { UserData } from './userDataModel';

export class Post {
  _id: string;
  imagePath: string;
  commentListId: string;
  reactionListId: string;
  title: string;
  isLiked: boolean;
  liked: number;
  creator: UserData;
}
