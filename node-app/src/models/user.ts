export class User{
    constructor(
        public id: string, 
        public username: string, 
        public password: string,
        public versiontime: EpochTimeStamp,
        public data: string,
        public salt: string){}
}