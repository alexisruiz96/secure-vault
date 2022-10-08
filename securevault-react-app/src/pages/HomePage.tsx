import { useEffect, useState } from "react";

import { secureVault } from "../";
import { useAuth } from "../api/auth";
import DownloadFile from "../components/DownloadFile";
import MyDropzone from "../components/DropZone";
import RenderFile from "../components/RenderFile";
import { notify } from "../modules/notifications";
import { i18n } from "../i18n/i18n";

const HomePage: React.FC = () => {
    // SET VARIABLES
    const { user, logout, storage, eventSource } = useAuth();
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
    const [homeStorage,setHomeStorage] = useState<string | null>(storage);
    const [isEventSourceActive, setIsEventSourceActive] = useState(false);

    const getUpdatedStorage = async (result:any) => {
        secureVault.getReadableStorage(result).then((response) => {
            setHomeStorage(JSON.stringify(JSON.parse(response.data), undefined,2));
            localStorage.setItem("vault_data_epochtime", response.epochtime.toString());
            console.log("Vault updated");
        });
    }

    useEffect(() => {
        setHomeStorage(() => storage);
      }, [storage]); 
    
    useEffect( () => {
        if (eventSource && !isEventSourceActive) {
            eventSource.onmessage = (result) => {
                const data = JSON.parse(result.data);
                const localEpoch = (localStorage.getItem("vault_data_epochtime")!==null)?parseInt(localStorage.getItem("vault_data_epochtime")!):0;
                const remoteEpoch = parseInt(data.epochtime);
                if (remoteEpoch > localEpoch) {
                    getUpdatedStorage(result);
                }
            };
            
            eventSource.onerror = (err) => {
                console.log("EventSource error: ", err);
            };

            eventSource.onopen = () => {
                console.log("EventSource opened");
            };
            
            setIsEventSourceActive(true);
        }
    }, [eventSource, isEventSourceActive]);

    const handleUpload = async () => {
        if (uploadState === "Uploading") return;
        setUploadState("Uploading");

        try {
            if (file === null) throw new Error("File is empty");

            //TODO define response
            const response = await secureVault.setStorage(file);
            if (response.status === 500) throw new Error(response.data.message);

            //TODO define type/interface on library for data
            setHomeStorage(response.data.storage);
            setDownloadPage(response.data.downloadPage);
            setUploadState("Upload Successful");
            notify(i18n.file_upload_success, "success");
            await new Promise((f) => setTimeout(f, 1000));
            setDownloadActive(response.data.downloadActive);
            setUploadState("Upload");
            setIsUploadActive(false);
            console.log(i18n.file_upload_success);
        } catch (error: any) {
            console.error(error);
            setUploadState("Upload Failed");
            notify(i18n.file_upload_error, "error");
            notify(error.message, "error");
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
                <div className="welcome bg-slate-500 rounded-md space-y-3 flex flex-col">
                    <div className="pt-8">
                        <h2 className="text-center w-full">
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
                        
                        <div className="w-full text-left bg-slate-400 h-96 rounded-md pl-2 mt-6 h-full">
                            <pre className="max-w-full overflow-auto"><code>{homeStorage}</code></pre>
                        </div>
                        
                    </div>
                    <div className="relative bottom-1  pt-12 text-right mt-auto">
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
