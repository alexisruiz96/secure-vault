import React, {useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {useAuth, AuthContextType} from '../api/auth'

interface User {
    username: string,
    email:string,
    password: string
}

const LoginPage:React.FC = () => {

    const [details, setDetails] = useState({username:"", email: "", password:""});
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const {login, isAuthenticated} = useAuth() as AuthContextType;
    
    const Login = async (details:User) => {
        debugger;
        
        await login(details);
        console.log(details);

        if(isAuthenticated) {
            console.log('Logged in!');
            navigate('/');
        } else {
            setError("Invalid username or password");
        }
    }

    const submitHandler = (event:React.FormEvent) => {
        event.preventDefault();
        Login(details);
    }

    return (
        <div className="App">
            <form onSubmit={submitHandler}>
                <div className='form-inner'>
                    <h2>Login</h2>
                    {(error !=="") ? ( <div className='error'>{error}</div>) : ''}
                    <div className='form-group'>
                        <label htmlFor="username">Username:</label>
                        <input type="text" name='username' id='username' onChange={event => setDetails({...details, username: event.target.value})} value={details.username}/>
                    </div>
                    <div className='form-group'>
                        <label htmlFor="email">Email: </label>
                        <input type="email" name="email" id="email" onChange={event => setDetails({...details, email: event.target.value})} value={details.email}/>
                    </div>
                    <div className='form-group'>
                        <label htmlFor="password">Password: </label>
                        <input type="password" name="password" id="password" onChange={event => setDetails({...details, password: event.target.value})} value={details.password}/>
                    </div>
                    <input type="submit" value="Submit" />
                    <button onClick={() => navigate('/signup')}>Sign Up</button>
                </div>
            </form>
        </div>
    )
}

export default LoginPage;
