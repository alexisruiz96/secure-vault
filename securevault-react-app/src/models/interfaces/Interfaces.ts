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

export interface IUserLogin {
    username: string;
    password: string;
    salt: string;
}

export interface VaultKey {
    base64Salt: string;
    base64Pwd: string;
}
