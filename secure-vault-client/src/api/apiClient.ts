import axios, { AxiosResponse, AxiosInstance } from 'axios';
import { ILoginUser, User } from '../interfaces/interfaces';

//TODO add this and test it to check it works
//TODO handle this requests adding a jwt or some kind of token

//TODO: test this
        
// const timeMax = 30000;
        
// axios.defaults.baseURL = "http://localhost:4000/";

export class ApiClient{
    private _axios: AxiosInstance;
    constructor(baseUrl: string, timeout: number){
        this._axios = axios.create({
            baseURL: baseUrl,
            timeout: timeout,
        })
    }
    
    
    //Utils
    private checkAppendedFormData(formData: FormData){
        for (let element of formData.entries()) {
            console.log(element[0]+ ', ' + element[1]); 
        }
    }
    
    async signUp(user: User): Promise<string>{
        try {
            const response = await this._axios({
                method: "post",
                url: "users/signup",
                data: {
                    username: user.username,
                    password: user.password,
                    epochtime: user.epochtime,
                    data: user.data,
                    email: user.email,
                },
                headers: {
                    Allow: "POST",
                    "Content-Type": "application/json",
                },
            });
            console.log(response);
        } catch (error) {
            console.error("Error creating user.");
        }
    
        return "";
    }
    
    async login(user: ILoginUser): Promise<AxiosResponse>{
        
        const response = await this._axios({
            method: "post",
            url: "users/login",
            data: {
                username: user.username,
                password: user.password            },
            headers: {
                Allow: "POST",
                "Content-Type": "application/json",
            },
        });
        this._axios.defaults.headers.common['Authorization'] = 'JWT ' + response.data.auth_token;
        return response;
    }
    
    logout(): void{
        this._axios.defaults.headers.common['Authorization'] = '';
    }
    
    async uploadData(
        formData: FormData, username: string, saltdata: string
    ): Promise<AxiosResponse>{
        
        this.checkAppendedFormData(formData);
        //TODO add try catch
        return this._axios({
            method: "post",
            url: "files/upload",
            data: formData,
            headers: {
                Allow: "POST",
                "Content-Type": "multipart/form-data",
                username: username,
                saltdata: saltdata,
            },
        });
    }
    
    //TODO: add jwt to the authorization header
    async getDataSalt(user: string){
        return this._axios({
            method: "get",
            url: "files/salt",
            params: {
                username: user,
            },
            headers: {
                Allow: "GET",
                "Content-Type": "application/json",
            },
        });
    }
}
