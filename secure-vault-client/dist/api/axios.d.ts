import { AxiosResponse } from 'axios';
import { ILoginUser, User } from '../interfaces/interfaces';
export declare class ApiClient {
    private _axios;
    constructor(baseUrl: string, timeout: number);
    private checkAppendedFormData;
    signUp(user: User): Promise<string>;
    login(user: ILoginUser): Promise<AxiosResponse>;
    logout(): void;
    uploadData(formData: FormData, username: string, saltdata: string): Promise<AxiosResponse>;
    getDataSalt(user: string): Promise<AxiosResponse<any, any>>;
}
