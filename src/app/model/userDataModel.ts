export class UserData {
  constructor(_userId, _username, _name, _avatarPath) {
    this.userId = _userId;
    this.avatarPath = _avatarPath;
    this.name = _name;
    this.username = _username;
  }
  username: string;
  name: string;
  userId: string;
  avatarPath: string;
}
