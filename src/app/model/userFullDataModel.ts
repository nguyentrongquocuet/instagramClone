export class UserFullData {
  constructor(_userId, _username, _name, _avatarPath, _token, _expiresIn) {
    this.userId = _userId;
    this.avatarPath = _avatarPath;
    this.expiresIn = _expiresIn;
    this.name = _name;
    this.token = _token;
    this.username = _username;
  }
  username: string;
  name: string;
  userId: string;
  avatarPath: string;
  token: string;
  expiresIn: number;
}
