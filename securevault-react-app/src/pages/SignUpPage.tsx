import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { User } from '../models/interfaces/interfaces';
import { secureVault } from '..';
import { notify } from '../modules/notifications';
import { i18n } from '../i18n/i18n';

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
                notify(i18n.signup_success, i18n.toastify_success);
                navigate("/login");
            } else if(status === 500) {
                notify(i18n.signup_error, i18n.toastify_error);
            }
        } else {
            notify(i18n.signup_error_data, i18n.toastify_error);
            console.log(i18n.signup_error_data);
        }
    };

    return (
        <form onSubmit={submitHandler}>
            <div className="App">
                <div className="form-inner rounded-md">
                    <h2>{i18n.signup_signup}</h2>
                    <div className="form-group">
                        <label htmlFor="name">{i18n.signup_username}</label>
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
                        <label htmlFor="email">{i18n.signup_email}</label>
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
                        <label htmlFor="password">{i18n.signup_password}</label>
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
                            {i18n.signup_login}
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default SignUpPage;
