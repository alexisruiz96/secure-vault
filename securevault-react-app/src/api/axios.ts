import axios, { AxiosResponse } from 'axios';

import { IUserLogin } from "../models/interfaces/Interfaces";
import { checkAppendedFormData } from '../utils/FormDataUtils';

interface User {
    username: string;
    password: string;
    epochtime: EpochTimeStamp;
    data: string;
    salt: string;
    email: string;
}

//TODO add this and test it to check it works
//TODO handle this requests adding a jwt or some kind of token
// axios.defaults.baseURL = "http://localhost:4000/";

export const signUp = async (user: User): Promise<string> => {
    try {
        const response = await axios({
            method: "post",
            url: "http://localhost:4000/users/signup",
            timeout: 3000,
            data: {
                username: user.username,
                password: user.password,
                epochtime: user.epochtime,
                data: user.data,
                salt: user.salt,
                email: user.email,
            },
            headers: {
                Allow: "POST",
                "Content-Type": "application/json",
            },
        });
        console.log(response);
    } catch (error) {
        console.log("Error creating user.");
    }

    return "";
};

export const login = async (user: IUserLogin): Promise<AxiosResponse> => {
    debugger;
    
    //TODO move this to a utils file

    return axios({
        method: "post",
        url: "http://localhost:4000/users/login",
        timeout: 5000,
        data: {
            username: user.username,
            password: user.password,
            salt: user.salt,
        },
        headers: {
            Allow: "POST",
            "Content-Type": "application/json",
        },
    });
};

export const uploadData = async (
    formData: FormData, username: string, saltdata: string
): Promise<AxiosResponse> => {
    debugger;
    checkAppendedFormData(formData);
    //TODO add try catch
    return axios({
        method: "post",
        url: "http://localhost:4000/files/upload",
        timeout: 10000,
        data: formData,
        headers: {
            Allow: "POST",
            "Content-Type": "multipart/form-data",
            username: username,
            saltdata: saltdata,
        },
    });
};


export const getUserSalt = async (user: string) => {
    return axios({
        method: "get",
        url: "http://localhost:4000/users/salt",
        timeout: 5000,
        params: {
            username: user,
        },
        headers: {
            Allow: "GET",
            "Content-Type": "application/json",
        },
    });
}
/*
export const getUsers = async (req: Request, res: Response) => {};

export const getUserById = async (req: Request, res: Response) => {
    // try {
    //     const response = await axios.get('/users/ID=12345');
    //     console.log(response);
    // } catch (error) {
    //   console.error(error);
    // }
};

export const updateUser = async (req: Request, res: Response) => {};

export const deleteUser = async (req: Request, res: Response) => {};
*/