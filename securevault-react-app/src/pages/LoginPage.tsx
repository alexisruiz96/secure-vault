import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../api/auth';
import { ILoginUser } from '../models/interfaces/interfaces';
import { notify } from '../modules/notifications';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { login, isAuthenticated } = useAuth();

    const [details, setDetails] = useState({
        username: "",
        email: "",
        password: "",
    });

    const Login = async () => {

        const loginUser: ILoginUser = {
            username: details.username,
            password: details.password,
        };
        
        //Note: async login function
        await login(loginUser);

        if (isAuthenticated) {
            notify("Login successful", "success");
            console.log("Logged in!");
            navigate("/");
        } else {
            notify("Invalid username or password", "error");
        }
    };

    const submitHandler = (event: React.FormEvent) => {
        event.preventDefault();
        Login();
    };

    return (
        <div className="App">
            <form onSubmit={submitHandler}>
                <div className="form-inner rounded-md">
                    <h2>Login</h2>
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
