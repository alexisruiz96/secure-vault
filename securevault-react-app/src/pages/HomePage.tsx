import { useState } from 'react';
import {useAuth} from '../api/auth'
import MyDropzone from '../components/DropZone';


const HomePage:React.FC = () => {
  debugger;
  
  const {user,logout} = useAuth();
  const [file, setFile] = useState<File | null>(null);

  return (
    <div className="App">
      {
        //TODO add reference to new created page containing user uploaded data
        <div className="welcome bg-slate-500 rounded-md">
          <h2 className='text-center'>Welcome, <span>{user.username}</span></h2>
          <MyDropzone setFile={setFile}/>

          <div className='w-full text-center'>
            {file?.name}
          </div>
          <button className="pt-6">Upload</button>
          <button onClick={logout} className="pt-6">Logout</button>
        </div>
      }
    </div>
  );
}

export default HomePage;