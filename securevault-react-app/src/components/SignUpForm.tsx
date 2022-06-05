import React, {useState} from 'react'

type FormProps ={
    error: string;
    SignUp: (loginInfo: {name: string, email:string ,password: string}) => void;
}

const SignUpForm:React.FC<FormProps> = ({SignUp, error}) => {

    const [details, setDetails] = useState({name:"", email: "", password:""});

    const submitHandler = (event:React.FormEvent) => {
        event.preventDefault();

        SignUp(details);
    }

  return (
      <form onSubmit={submitHandler}>
          <div className='form-inner'>
              <h2>Sign Up</h2>
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
              <input type="submit" value="Sign Up" />
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
