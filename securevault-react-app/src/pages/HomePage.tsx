import { useState } from 'react';

import { useAuth } from '../api/auth';
import * as secureVaultApi from '../api/axios';
import DownloadFile from '../components/DownloadFile';
import MyDropzone from '../components/DropZone';
import RenderFile from '../components/RenderFile';
import { checkAppendedFormData } from '../utils/FormDataUtils';
import * as CryptoUtil from "../modules/CryptoUtils";

const HomePage: React.FC = () => {
    
    // SET VARIABLES
    const { user, logout, encryptionKey } = useAuth();
    const [file, setFile] = useState<File | null>(null);
    // const [salt, setSalt] = useState<string | null>(null);
    //TODO if we want to show several files, add an array of ids or something similar
    const [downloadActive, setDownloadActive] = useState(false);
    const [downloadPage, setDownloadPage] = useState<string | null>(null);
    const [uploadState, setUploadState] = useState<
        | "Upload"
        | "Uploading"
        | "Upload Failed"
        | "Upload Successful"
        | "Upload New File"
        | null
    >("Upload");
    const [isUploadActive, setIsUploadActive] = useState(true);

    const handleUpload = async () => {
        if (uploadState === "Uploading") return;
        setUploadState("Uploading");
        const formData: FormData = new FormData();
        //TODO encrypt file before uploading
        // const cryptoKey = await CryptoUtil.generateCryptoKey(encryptionKey.base64Pwd);
        
        formData.append("myFile", file as File);
        checkAppendedFormData(formData);
        try {
            const { data } = await secureVaultApi.uploadData(
                formData,
                user.username
            );
            debugger;
            setDownloadActive(data.downloadActive);
            setDownloadPage(data.downloadPage);
            setUploadState("Upload Successful");
            await new Promise((f) => setTimeout(f, 1000));
            setUploadState("Upload");
            setIsUploadActive(false);
            console.log("File uploaded successfully");
            //TODO make upload button disappear and download button appear
        } catch (error) {
            console.log(error);
            setUploadState("Upload Failed");
            await new Promise((f) => setTimeout(f, 1000));
            setUploadState("Upload");
            setIsUploadActive(true);
        }
    };

    const handleNewFile = () => {
        setIsUploadActive(true);
    };

    return (
        <div className="App">
            {
                //TODO add reference to new created page containing user uploaded data
                <div className="welcome bg-slate-500 rounded-md">
                    <h2 className="text-center">
                        Welcome, <span>{user.username}</span>
                    </h2>
                    {isUploadActive && <MyDropzone setFile={setFile} />}
                    {!isUploadActive && <DownloadFile />}
                    <div className="w-full text-center">
                        {file && (
                            <RenderFile
                                file={{
                                    name: file.name,
                                    sizeInBytes: file?.size,
                                    format: file.type.split("/")[1],
                                }}
                            />
                        )}
                    </div>
                    <div>
                        {isUploadActive && (
                            <button className="pt-6" onClick={handleUpload}>
                                {uploadState}
                            </button>
                        )}
                        {!isUploadActive && (
                            <button className="pt-6" onClick={handleNewFile}>
                                Upload New File
                            </button>
                        )}
                        {/* TODO Upload New File button to show the dropzone */}
                        {downloadActive && (
                            <a href={downloadPage as string}>
                                <button className="pt-6">
                                    Download
                                    {/* TODO SAVE URL IN ENV */}
                                    {/* <a href={`${process.env.REACT_APP_BACKEND_URL}/${user.username}/download`}>Download</a> */}
                                </button>
                            </a>
                        )}
                        <button className="pt-6" onClick={logout}>
                            Logout
                        </button>
                    </div>
                </div>
            }
        </div>
    );
};

export default HomePage;
