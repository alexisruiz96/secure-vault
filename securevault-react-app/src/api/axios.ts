import axios, { AxiosResponse } from 'axios';
import { UserType } from '../models/interfaces/User';
import * as CryptoUtil from '../modules/CryptoUtil'

interface User {
    username: string,
    password: string,
    epochtime: EpochTimeStamp,
    data: string,
    salt: string,
    email:string,

}

export const createUser = async (user: User): Promise<string> => {
    
  try {
    const response = await axios({
        method: 'post',
        url: 'http://localhost:4000/users/signup',
        timeout:3000,
        data: {
            username: user.username,
            password: user.password,
            epochtime: user.epochtime,
            data: user.data,
            salt: user.salt,
            email:user.email,
        },
        headers:{
          'Allow': 'POST',
          'Content-Type': 'application/json',
        }
      });
      console.log(response);
    } catch (error) {
        console.log('Error creating user.');
    }
    
    return "";
};

export const login = async (user: UserType): Promise<AxiosResponse> => {
  
  debugger;
  
  const saltResponse = await axios({
      method: 'get', url: 'http://localhost:4000/users/salt', timeout:3000,
      params: {
          "username": user.username
      },
      headers:{
        'Allow': 'GET', 'Content-Type': 'application/json',
      }
  });

  const passwordScrypt = await CryptoUtil.generateKey(user.password, saltResponse.data.salt);

  const response = await axios({
      method: 'post', url: 'http://localhost:4000/users/login', timeout:3000,
      data: {
          username: user.username, password: passwordScrypt.base64Pwd, salt: saltResponse.data.salt
      },
      headers:{
        'Allow': 'POST', 'Content-Type': 'application/json',
      }
  });

    console.log(response);
  return response;
};

export const getUsers = async (req:Request, res: Response) => {
    
    
}

export const getUserById = async (req:Request, res: Response)=> {
    try {
        const response = await axios.get('/users/ID=12345');
        console.log(response);
      } catch (error) {
        console.error(error);
      }
}

export const updateUser=  async (req:Request, res: Response) => {
    
}

export const deleteUser = async (req:Request, res: Response) => {

    
}
