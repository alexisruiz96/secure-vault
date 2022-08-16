export const sizeInMb = (sizeInBytes: number) => {
    return `${(sizeInBytes / 1024 / 1024).toFixed(2)} MB`;
}