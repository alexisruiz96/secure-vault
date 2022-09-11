import axios, { AxiosResponse } from 'axios';

import { ILoginUser, User } from "../models/interfaces/interfaces";
import { checkAppendedFormData } from '../utils/FormDataUtils';

//TODO add this and test it to check it works
//TODO handle this requests adding a jwt or some kind of token
// axios.defaults.baseURL = "http://localhost:4000/";
// axios.defaults.headers.common['Authorization'] = AUTH_TOKEN;
// axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

//TODO: test this
// export const axiosInstance = axios.create({
//     baseURL: "http://localhost:4000/",
//     headers: {
//         'Content-Type': 'application/x-www-form-urlencoded',
//     }
// });

const timeMax = 30000;

export const signUp = async (user: User): Promise<string> => {
    try {
        const response = await axios({
            method: "post",
            url: "http://localhost:4000/users/signup",
            timeout: timeMax,
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
};

export const login = async (user: ILoginUser): Promise<AxiosResponse> => {
    
    return axios({
        method: "post",
        url: "http://localhost:4000/users/login",
        timeout: timeMax,
        data: {
            username: user.username,
            password: user.password
            //TODO delete salt from server side login
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
    
    checkAppendedFormData(formData);
    //TODO add try catch
    return axios({
        method: "post",
        url: "http://localhost:4000/files/upload",
        timeout: timeMax,
        data: formData,
        headers: {
            Allow: "POST",
            "Content-Type": "multipart/form-data",
            username: username,
            saltdata: saltdata,
        },
    });
};

//TODO delete get user salt from server side
// export const getUserSalt = async (user: string) => {
//     return axios({
//         method: "get",
//         url: "http://localhost:4000/users/salt",
//         timeout: 5000,
//         params: {
//             username: user,
//         },
//         headers: {
//             Allow: "GET",
//             "Content-Type": "application/json",
//         },
//     });
// }

//TODO: add jwt to the authorization header
export const getDataSalt = async (user: string) => {
    return axios({
        method: "get",
        url: "http://localhost:4000/files/salt",
        timeout: timeMax,
        params: {
            username: user,
        },
        headers: {
            Allow: "GET",
            "Content-Type": "application/json",
        },
    });
}

//TODO: add functionality to this functions
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