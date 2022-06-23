import React, {useState} from 'react';
import LoginForm from './LoginForm';

interface User {
    username: string,
    email:string,
    password: string
}

const HomePage:React.FC = () => {

  const adminUser = {
      email: "admin@admin.com",
      password: "admin123"
  }

  const [user, setUser] = useState({username:"", email: ""});
  const [error, setError] = useState("");

  const Login = async (details:User) => {
    console.log(details);
    //TODO send user and password to the server to check if it is correct
    if(details.email === adminUser.email && details.password === adminUser.password)
    {
      // await console.log(CryptoUtil.generateKey(details.password))
      console.log('Logged in!');
      setUser({
        username: details.username,
        email: details.email
      })
    } else{
      console.log('Details do not match');
      setError('Details do not match');
    }
  }

  const Logout = () => {
    setUser({username:"", email: ""});
  }

  return (
    <div className="App">
      {(user.email !== "") ? (
        //TODO add reference to new created page containing user uploaded data
        <div className="welcome">
          <h2>Welcome, <span>{user.username}</span></h2>
          <button onClick={Logout}>Logout</button>
        </div>
      ) : (
        <LoginForm Login={Login} error={error}/>
      )}
    </div>
  );
}

export default HomePage;