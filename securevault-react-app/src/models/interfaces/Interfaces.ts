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
