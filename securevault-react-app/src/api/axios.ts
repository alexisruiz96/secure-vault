import axios, { AxiosResponse } from 'axios';

import { ILoginUser, User } from "../models/interfaces/interfaces";

export const reactAxios = axios.create({
    baseURL: "http://localhost:4000/",
    timeout: 30000,
})
        
//Storage and login/signup functions moved to the library

/*
    TODO: add functionality to this functions

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