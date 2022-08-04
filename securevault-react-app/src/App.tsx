import React from 'react';
import SignUpPage from './components/SignUpPage';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import HomePage from './components/HomePage'
import LoginPage from './components/LoginPage';
import { ProtectedRoute } from './components/route/ProtectedRoute';
import { AuthProvider } from './api/auth';


const App:React.FC = () => {

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path='/' element={<ProtectedRoute><HomePage/></ProtectedRoute>}/>
          <Route path='/login' element={<LoginPage/>}/>
          <Route path='/signup' element={<SignUpPage/>}/>
          <Route path='*' element={<h1>404 Not found</h1>}/>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;