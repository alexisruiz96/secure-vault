import { useState } from 'react';
import {useAuth} from '../api/auth'
import MyDropzone from '../components/DropZone';
import RenderFile from '../components/RenderFile'; 
import { uploadData } from "../api/axios";


const HomePage:React.FC = () => {
  debugger;
  
  const {user,logout} = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [id, setId] = useState(null);
  const [downloadPage, setDownloadPage] = useState(false);

  const handleUpload = async () => {
    
    try {
      const formData = new FormData();
      formData.append('file', file as File);
      const {data} = await uploadData(formData);
      console.log(data);
      
    } catch (error) {
      console.log(error);
    }
      
    
  }

  return (
    <div className="App">
      {
        //TODO add reference to new created page containing user uploaded data
        <div className="welcome bg-slate-500 rounded-md">
          <h2 className='text-center'>Welcome, <span>{user.username}</span></h2>
          <MyDropzone setFile={setFile}/>
          <div className='w-full text-center'>
            {
              file && (

                <RenderFile file={{
                  name: file?.name as string,
                  sizeInBytes: file?.size,
                  format: file?.type.split('/')[1] as string,
                }}/>
              )
            }

            {/* {file?.name} */}
          </div>
          <button className="pt-6">Upload</button>
          <button onClick={logout} className="pt-6">Logout</button>
        </div>
      }
    </div>
  );
}

export default HomePage;