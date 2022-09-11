import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import * as secureVaultApi from '../api/axios';
import { User } from '../models/interfaces/interfaces';
import { prefixSubKeys } from '../modules/config';
import * as CryptoUtil from '../modules/CryptoUtils';

const SignUpPage: React.FC = () => {
    const [details, setDetails] = useState({
        username: "",
        password: "",
        epochtime: 0,
        data: "",
        email: "",
    });
    const [error, setError] = useState("");

    const navigate = useNavigate();

    const submitHandler = (event: React.FormEvent) => {
        event.preventDefault();

        SignUp(details);
    };

    //TODO: change password name to authKey
    const SignUp = async (details: User) => {
        console.log(details);
        if (details.password != null) {
            const authKey = await CryptoUtil.generateKey(
                prefixSubKeys.authKey + details.password,
                true
            );
            let user = { ...details };
            user.password = authKey as string;

            secureVaultApi.signUp(user);
            navigate("/login");
        } else {
            console.log("Details do not match");
            setError("Details do not match");
        }
    };

    return (
        <form onSubmit={submitHandler}>
            <div className="App">
                <div className="form-inner rounded-md">
                    <h2>Sign Up</h2>
                    {error !== "" ? <div className="error">{error}</div> : ""}
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
