import React, {useState} from 'react'
import * as CryptoUtil from '../modules/CryptoUtil'
import {useNavigate} from 'react-router-dom'
import * as secureVaultApi from '../api/axios'


interface User {
    username: string,
    password: string,
    epochtime: EpochTimeStamp,
    data: string,
    salt: string,
    email:string,

}

const SignUpForm:React.FC = () => {

    const [details, setDetails] = useState({username:"", password:"", epochtime: 0, data:"", salt:"" ,email: "" });
    //const [, setUser] = useState({username:"", email: "", password:"", epochtime:0});
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
          const password_crypto = await CryptoUtil.generateKey(details.password);
          let user = {...details};
          user.password = password_crypto.base64Pwd;
          user.salt = password_crypto.base64IV;
          //TODO send user object to the server
          /* setUser({
          //   username: details.username,
          //   email: details.email,
          //   password: password_hash,
          //   epochtime: Date.now()
          // })
          */ console.log(details);
          secureVaultApi.createUser(user);
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

export default SignUpForm;
