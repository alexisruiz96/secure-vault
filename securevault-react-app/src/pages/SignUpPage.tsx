import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { User } from '../models/interfaces/interfaces';
import { secureVault } from '..';
import { notify } from '../modules/notifications';

const SignUpPage: React.FC = () => {
    const [details, setDetails] = useState({
        username: "",
        password: "",
        epochtime: 0,
        data: "",
        email: "",
    });

    const navigate = useNavigate();

    const submitHandler = (event: React.FormEvent) => {
        event.preventDefault();

        SignUp(details);
    };

    const SignUp = async (details: User) => {
        if (details.password && details.username) {
            const status: number = await secureVault.signUp(details);
            if(status === 201) {
                notify("Account created successfully", "success");
                navigate("/login");
            } else if(status === 500) {
                notify("Error creating user account", "error");
            }
        } else {
            notify("Please enter a username and password", "error");
            console.log("Details do not match");
        }
    };

    return (
        <form onSubmit={submitHandler}>
            <div className="App">
                <div className="form-inner rounded-md">
                    <h2>Sign Up</h2>
                    <div className="form-group">
                        <label htmlFor="name">Username:</label>
                        <input
                            type="text"
                            name="username"
                            id="name"
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
                    <div>
                        <input type="submit" value="Submit" />
                        <button onClick={() => navigate("/login")}>
                            Login
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default SignUpPage;
