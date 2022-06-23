import React, {useState} from 'react'
import * as CryptoUtil from '../modules/CryptoUtil'
import {useNavigate} from 'react-router-dom'


interface User {
    username: string,
    email:string,
    password: string
}

const SignUpForm:React.FC = () => {

    const [details, setDetails] = useState({username:"", email: "", password:""});
    const [, setUser] = useState({username:"", email: ""});
    const [error, setError] = useState("");

    const navigate = useNavigate();

    const submitHandler = (event:React.FormEvent) => {
        event.preventDefault();

        SignUp(details);
    }

    const SignUp = async (details:User) => {
        console.log(details);
    
        if(details.password != null)
        {
          await console.log(CryptoUtil.generateKey(details.password))
          //TODO send user object to the server
          console.log('Signed up!');
          setUser({
            username: details.username,
            email: details.email
          })
        } else{
          console.log('Details do not match');
          setError('Details do not match');
        }
    }

  return (
      <form onSubmit={submitHandler}>
          <div className="App">
            <div className='form-inner'>
                <h2>Sign Up</h2>
                {(error !=="") ? ( <div className='error'>{error}</div>) : ''}
                <div className='form-group'>
                    <label htmlFor="name">Username:</label>
                    <input type="text" name='username' id='name' onChange={event => setDetails({...details, username: event.target.value})} value={details.username}/>
                </div>
                <div className='form-group'>
                    <label htmlFor="email">Email: </label>
                    <input type="email" name="email" id="email" onChange={event => setDetails({...details, email: event.target.value})} value={details.email}/>
                </div>
                <div className='form-group'>
                    <label htmlFor="password">Password: </label>
                    <input type="password" name="password" id="password" onChange={event => setDetails({...details, password: event.target.value})} value={details.password}/>
                </div>
                <div>
                    <input type="submit" value="Sign Up" />
                    <button onClick={() => navigate('/')}>Login</button>
                </div>
            </div>
          </div>
      </form>
  )
}

{/* 
    <h1>Sign up</h1>
    <form action="/signup" method="post">
        <section>
            <label for="username">Username</label>
            <input id="username" name="username" type="text" autocomplete="username" required>
        </section>
        <section>
            <label for="new-password">Password</label>
            <input id="new-password" name="password" type="password" autocomplete="new-password" required>
        </section>
        <button type="submit">Sign up</button>
    </form>
    <form action="/login">  <!-- when the formulary is submitted, it will be POSTed to /login-->
        <div>
            <input type="submit" value="Log In" />
        </div>
    </form> */}

export default SignUpForm;
