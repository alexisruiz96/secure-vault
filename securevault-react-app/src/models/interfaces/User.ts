export interface User {
    username: string,
    password: string,
    epochtime: EpochTimeStamp,
    data: string,
    salt: string,
    email:string,

}

export type UserType = User;