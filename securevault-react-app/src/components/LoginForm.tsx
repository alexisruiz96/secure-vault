import React, {useState} from 'react'

type FormProps ={
    error: string;
    Login: (loginInfo: {name: string, email:string ,password: string}) => void;
}

const LoginForm:React.FC<FormProps> = ({Login, error}) => {

    const [details, setDetails] = useState({name:"", email: "", password:""});

    const submitHandler = (event:React.FormEvent) => {
        event.preventDefault();

        Login(details);
    }

  return (
      <form onSubmit={submitHandler}>
          <div className='form-inner'>
              <h2>Login</h2>
              {(error !=="") ? ( <div className='error'>{error}</div>) : ''}
              <div className='form-group'>
                  <label htmlFor="name">Name:</label>
                  <input type="text" name='name' id='name' onChange={event => setDetails({...details, name: event.target.value})} value={details.name}/>
              </div>
              <div className='form-group'>
                  <label htmlFor="email">Email: </label>
                  <input type="email" name="email" id="email" onChange={event => setDetails({...details, email: event.target.value})} value={details.email}/>
              </div>
              <div className='form-group'>
                  <label htmlFor="password">Password: </label>
                  <input type="password" name="password" id="password" onChange={event => setDetails({...details, password: event.target.value})} value={details.password}/>
              </div>
              <input type="submit" value="Login" />
          </div>
      </form>
  )
}

export default LoginForm;
