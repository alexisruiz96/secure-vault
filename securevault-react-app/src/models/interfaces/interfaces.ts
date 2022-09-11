export interface User {
    username: string;
    password: string;
    epochtime: EpochTimeStamp;
    data: string;
    email: string;
}
export interface IFile {
    name: string;
    sizeInBytes: number;
    format: string;
    id?: string;
}

export interface ImageLoaderProps {
    items: {
        [key: string]: string;
    };
}

export interface ILoginUser {
    username: string;
    password: string;
}