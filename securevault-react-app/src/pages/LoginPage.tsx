import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../api/auth';
import { IUserLogin } from '../models/interfaces/Interfaces';
import * as secureVaultApi from "../api/axios";
import * as CryptoUtil from "../modules/CryptoUtils";



const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { login, isAuthenticated } = useAuth();

    const [details, setDetails] = useState({
        username: "",
        email: "",
        password: "",
    });
    const [error, setError] = useState("");

    const Login = async () => {
        debugger;
        const saltResponse = await secureVaultApi.getUserSalt(details.username);

        const passwordScrypt = await CryptoUtil.generateKey(
            details.password,
            saltResponse.data.salt
        );

        const loginUser: IUserLogin = {
            username: details.username,
            salt: saltResponse.data.salt,
            password: passwordScrypt.base64Pwd,
        };


        await login(loginUser);

        if (isAuthenticated) {
            console.log("Logged in!");
            navigate("/");
        } else {
            setError("Invalid username or password");
        }
    };

    const submitHandler = (event: React.FormEvent) => {
        event.preventDefault();
        Login();
    };

    return (
        <div className="App">
            <form onSubmit={submitHandler}>
                <div className="form-inner">
                    <h2>Login</h2>
                    {error !== "" ? <div className="error">{error}</div> : ""}
                    <div className="form-group">
                        <label htmlFor="username">Username:</label>
                        <input
                            type="text"
                            name="username"
                            id="username"
                            onChange={(event) =>
                                setDetails({
                                    ...details,
                                    username: event.target.value,
                                })
                            }
                            value={details.username}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email: </label>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            onChange={(event) =>
                                setDetails({
                                    ...details,
                                    email: event.target.value,
                                })
                            }
                            value={details.email}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password: </label>
                        <input
                            type="password"
                            name="password"
                            id="password"
                            onChange={(event) =>
                                setDetails({
                                    ...details,
                                    password: event.target.value,
                                })
                            }
                            value={details.password}
                        />
                    </div>
                    <input type="submit" value="Submit" />
                    <button onClick={() => navigate("/signup")}>Sign Up</button>
                </div>
            </form>
        </div>
    );
};

export default LoginPage;
