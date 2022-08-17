import { useState } from 'react';
import {useAuth} from '../api/auth'
import MyDropzone from '../components/DropZone';
import RenderFile from '../components/RenderFile'; 
import { uploadData } from "../api/axios";


const HomePage:React.FC = () => {
  debugger;
  
  const {user,logout} = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [, setId] = useState(null);
  const [downloadPage, setDownloadPage] = useState(false);
  const [uploadState, setUploadState] = useState<"Upload" | "Uploading" | "Upload Failed" | "Upload Successful" | null>("Upload");

  const handleUpload = async () => {
    
    if(uploadState === "Uploading") return;
    setUploadState("Uploading");
    const formData = new FormData();
    formData.append('newFile', file as File);
    try {
      const {data} = await uploadData(formData);
      setId(data.id);
      setDownloadPage(data.downloadPage);
      console.log(data);
      setUploadState("Upload Successful");
      // await new Promise(f => setTimeout(f, 1000));
      //TODO make upload button disappear and download button appear
      
    } catch (error) {
      console.log(error);
      setUploadState("Upload Failed");
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

                <RenderFile 
                  file={{
                    name: file?.name as string,
                    sizeInBytes: file?.size,
                    format: file?.type.split('/')[1] as string,
                  }
                }/>
              )
            }

            {/* {file?.name} */}
          </div>
          <div >
            <button className="pt-6" onClick={handleUpload}>{uploadState}</button>
            <button className="pt-6" onClick={logout}>Logout</button>
            <button className="pt-6 invisible" >Download</button>
            
            {
              downloadPage && <div>
                <a href={`${process.env.REACT_APP_BACKEND_URL}/${user.username}/download`}>Download</a>
              </div>
            }
          </div>
        </div>
      }
    </div>
  );
}

export default HomePage;