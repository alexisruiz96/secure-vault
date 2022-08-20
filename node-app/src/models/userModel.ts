export class User {
  constructor(
    public id: string,
    public username: string,
    public password: string,
    public epochtime: EpochTimeStamp,
    public data: string,
    public salt: string,
    public email: string
  ) {}
}

export type Login = {
  username: string;
  password: string;
  salt: string;
};

export type UserName = {
  username: string;
};
