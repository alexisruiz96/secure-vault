import React from 'react';
import SignUpForm from './components/SignUpForm';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import HomePage from './components/HomePage'

const App:React.FC = () => {

  return (
    // </div>
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<HomePage/>}></Route>
        <Route path='/signup' element={<SignUpForm/>}></Route>
        <Route path='*' element={<h1>404 Not found</h1>}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;