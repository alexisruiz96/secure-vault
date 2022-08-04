import React from 'react';
import {useAuth} from '../api/auth'


const HomePage:React.FC = () => {
  debugger;
  
  const {user,logout} = useAuth();
  

  return (
    <div className="App">
      {
        //TODO add reference to new created page containing user uploaded data
        <div className="welcome">
          <h2>Welcome, <span>{user.username}</span></h2>
          <button onClick={logout}>Logout</button>
        </div>
      }
    </div>
  );
}

export default HomePage;