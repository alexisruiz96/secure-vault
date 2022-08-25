import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';

import { useAuth } from '../api/auth';
import * as axios from '../api/axios';
import MyDropzone from '../components/DropZone';
import RenderFile from '../components/RenderFile';
import { checkAppendedFormData } from "../utils/FormDataUtils";

const HomePage: React.FC = () => {
    // const navigate = useNavigate();

    const { user, logout } = useAuth();
    const [file, setFile] = useState<File | null>(null);
    const [, setId] = useState(null);
    const [downloadPage, setDownloadPage] = useState(false);
    const [uploadState, setUploadState] = useState<
        "Upload" | "Uploading" | "Upload Failed" | "Upload Successful" | "Upload New File" | null
    >("Upload");

    const handleUpload = async () => {
        if (uploadState === "Uploading") return;
        setUploadState("Uploading");
        const formData: FormData = new FormData();
        //TODO encrypt file before uploading
        
        formData.append("myFile", file as File);
        checkAppendedFormData(formData);
        try {
            const { data } = await axios.uploadData(formData,user.username);
            setId(data.id);
            setDownloadPage(data.downloadPage);
            console.log(data);
            setUploadState("Upload Successful");
            await new Promise(f => setTimeout(f, 1000));
            setUploadState("Upload New File");
            //TODO make upload button disappear and download button appear
        } catch (error) {
            console.log(error);
            setUploadState("Upload Failed");
            await new Promise(f => setTimeout(f, 1000));
            setUploadState("Upload");
        }
    };

    return (
        <div className="App">
            {
                //TODO add reference to new created page containing user uploaded data
                <div className="welcome bg-slate-500 rounded-md">
                    <h2 className="text-center">
                        Welcome, <span>{user.username}</span>
                    </h2>
                    <MyDropzone setFile={setFile} />
                    <div className="w-full text-center">
                        {file && (
                            <RenderFile
                                file={{
                                    name: file?.name as string,
                                    sizeInBytes: file?.size,
                                    format: file?.type.split("/")[1] as string,
                                }}
                            />
                        )}

                        {/* {file?.name} */}
                    </div>
                    <div>
                        <button className="pt-6" onClick={handleUpload}>
                            {uploadState}
                        </button>
                        <button className="pt-6" onClick={logout}>
                            Logout
                        </button>
                        <button className="pt-6 invisible">Download</button>

                        {downloadPage && (
                            <div>
                                {/* <a href={`${process.env.REACT_APP_BACKEND_URL}/${user.username}/download`}>Download</a> */}
                            </div>
                        )}
                    </div>
                </div>
            }
        </div>
    );
};

export default HomePage;
