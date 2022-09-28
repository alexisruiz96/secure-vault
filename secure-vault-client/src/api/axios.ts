import axios, { AxiosResponse } from 'axios';

//TODO add this and test it to check it works
//TODO handle this requests adding a jwt or some kind of token

//TODO: test this
// export const axiosInstance = axios.create({
    //     baseURL: "http://localhost:4000/",
    //     headers: {
        //         'Content-Type': 'application/x-www-form-urlencoded',
        //     }
        // });
        
const timeMax = 30000;
        
axios.defaults.baseURL = "http://localhost:4000/";

//Interfaces
interface User {
    username: string;
    password: string;
    epochtime: EpochTimeStamp;
    data: string;
    email: string;
}

interface ILoginUser {
    username: string;
    password: string;
}

//Utils
const checkAppendedFormData = (formData: FormData)  => {
    for (let element of formData.entries()) {
        console.log(element[0]+ ', ' + element[1]); 
    }
}

export const signUp = async (user: User): Promise<string> => {
    try {
        const response = await axios({
            method: "post",
            url: "users/signup",
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
    
    const response = await axios({
        method: "post",
        url: "users/login",
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
    axios.defaults.headers.common['Authorization'] = 'JWT ' + response.data.auth_token;
    return response;
};

export const logout = (): void => {
    axios.defaults.headers.common['Authorization'] = '';
};

export const uploadData = async (
    formData: FormData, username: string, saltdata: string
): Promise<AxiosResponse> => {
    
    checkAppendedFormData(formData);
    //TODO add try catch
    return axios({
        method: "post",
        url: "files/upload",
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

//TODO: add jwt to the authorization header
export const getDataSalt = async (user: string) => {
    return axios({
        method: "get",
        url: "files/salt",
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