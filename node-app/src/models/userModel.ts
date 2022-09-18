export class User {
  constructor(
    private _id: number,
    public username: string,
    public password: string,
    public epochtime: EpochTimeStamp,
    public data: string | null,
    public salt: string,
    public email: string
    ) {}
    public get id(): number {
      return this._id;
    }
    public set id(value: number) {
      this._id = value;
    }
}

export type Login = {
  username: string;
  password: string;
};

export type UserName = {
  username: string;
};
