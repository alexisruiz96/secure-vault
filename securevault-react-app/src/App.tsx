import React, {useState} from 'react';
import SignUpForm from './components/SignUpForm';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import HomePage from './components/HomePage'

interface User {
    username: string,
    email:string,
    password: string
}

const App:React.FC = () => {

  const [error,setError] = useState("");
  return (
    // </div>
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<HomePage/>}></Route>
        <Route path='signup' element={<SignUpForm/>}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
