import { useEffect, useState } from 'react';

import { secureVault } from '../';
import { useAuth } from '../api/auth';
import DownloadFile from '../components/DownloadFile';
import MyDropzone from '../components/DropZone';
import RenderFile from '../components/RenderFile';
import { notify } from '../modules/notifications';
import { i18n } from '../i18n/i18n';

const HomePage: React.FC = () => {
    // SET VARIABLES
    const { user, logout } = useAuth();
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

    // useEffect(() => {
    //     debugger;
    //     const getStorage = async () =>{
    //         const response = await secureVault.getStorage();
    //         if (response.status === 200) {
    //             setDownloadActive(true);
    //             setDownloadPage(response.data.page);
    //         }
    //     } 
    //     getStorage().catch((error) => {
    //         console.log(error);
    //     });
    // }, []);

    const handleUpload = async () => {
        if (uploadState === "Uploading") return;
        setUploadState("Uploading");

        try {
            if (file === null) throw new Error("File is empty");
            
            const response = await secureVault.setStorage(file);

            //TODO define type/interface on library for data
            setDownloadPage(response.downloadPage);
            setUploadState("Upload Successful");
            notify(i18n.file_upload_success,"success");
            await new Promise((f) => setTimeout(f, 1000));
            setDownloadActive(response.downloadActive);
            setUploadState("Upload");
            setIsUploadActive(false);
            console.log(i18n.file_upload_success);
        } catch (error) {
            console.error(error);
            setUploadState("Upload Failed");
            notify(i18n.file_upload_error,"error");
            await new Promise((f) => setTimeout(f, 1000));
            setUploadState("Upload");
            setIsUploadActive(true);
        }
    };

    const handleNewFile = () => {
        setIsUploadActive(true);
    };

    //TODO add try/catch block and check if url is outdated
    const handleDownload = async () => {
        try {
            if (downloadPage === null)
                throw new Error("Download is not available");
            secureVault.downloadStorageToDisk();
        } catch (error) {
            console.error(error);
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
                                {i18n.home_upload}
                            </button>
                        )}
                        {downloadActive && (
                            <button className="pt-6" onClick={handleDownload}>
                                {i18n.home_download}
                            </button>
                        )}
                        <button className="pt-6" onClick={logout}>
                            {i18n.home_logout}
                        </button>
                    </div>
                </div>
            }
        </div>
    );
};

export default HomePage;
