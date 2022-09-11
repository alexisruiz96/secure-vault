import { useState } from "react";

import { useAuth } from "../api/auth";
import * as secureVaultApi from "../api/axios";
import DownloadFile from "../components/DownloadFile";
import MyDropzone from "../components/DropZone";
import RenderFile from "../components/RenderFile";
import * as CryptoUtil from "../modules/CryptoUtils";
import { checkAppendedFormData } from "../utils/FormDataUtils";

const HomePage: React.FC = () => {
    // SET VARIABLES
    const { user, logout, userCryptoKey } = useAuth();
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
        try {
            if (file === null) throw new Error("File is empty");
            // ENCRYPT FILE BLOCK
            const fileBinaryData = await file?.arrayBuffer();
            const encryptedDataFileStringify = await CryptoUtil.encryptData(
                userCryptoKey,
                fileBinaryData as ArrayBuffer
            );
            const encryptedDataFileJSON = JSON.parse(
                encryptedDataFileStringify as string
            );
            const encryptedDataBuffer = CryptoUtil.convertBase64ToBuffer(
                encryptedDataFileJSON[0]?.encryptedData
            );
            const encryptedFile = new File(
                [encryptedDataBuffer],
                file?.name as string,
                { type: file?.type }
            );

            formData.append("myFile", encryptedFile as File);
            // END ENCRYPT FILE BLOCK

            // formData.append("myFile", file as File);

            checkAppendedFormData(formData);
            const { data } = await secureVaultApi.uploadData(
                formData,
                user.username,
                encryptedDataFileJSON[0]?.iv
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
            console.error(error);
            setUploadState("Upload Failed");
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
        const saltDataResponse = await secureVaultApi.getDataSalt(
            user.username
        );
        const saltData = saltDataResponse.data.salt;
        const res = await fetch(downloadPage as string,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                    },
                }
            )
            .then((response) => response.body)
            .then((rb) => {
                if (rb === null) throw new Error("Response body is null");
                const reader = rb.getReader();

                return new ReadableStream({
                    start(controller) {
                        // The following function handles each data chunk
                        const push = () => {
                            // "done" is a Boolean and value a "Uint8Array"
                            reader.read().then(async ({ done, value }) => {
                                // If there is no more data to read
                                if (done) {
                                    console.log("done", done);
                                    controller.close();
                                    // saveBlob(doc, `fileName`);

                                    return;
                                }
                                const decryptedData = await CryptoUtil.decryptData(
                                    userCryptoKey,
                                    value,
                                    saltData
                                )
                                // Get the data and send it to the browser via the controller
                                controller.enqueue(decryptedData);
                                // Check chunks by logging to the console
                                console.log(done, value);
                                push();
                            });
                        }

                        push();
                    },
                });
            })
            .then((stream) =>
                // Respond with our stream
                stream.getReader().read().then(({ value }) => {
                    const blob = new Blob([value], { type: "image/png" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "download.png";
                    document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox
                    a.click();
                    a.remove();  //afterwards we remove the element again
                })
            
            )
            .then((result) => {
                // Do things with result
                console.log(result);
            })
            .catch(e => console.error(e.message));;
        
        console.log(res);
    };

    const saveBlob = (function () {
        const a = document.createElement('a');
        document.body.appendChild(a);
        a.setAttribute('style', 'display: none');
  
        return (blob: Blob, fileName: string) => {
          const url = window.URL.createObjectURL(blob);
          a.href = url;
          a.download = fileName;
          a.click();
          window.URL.revokeObjectURL(url);
        };
      })();
  

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
                            // <a
                            //     href={downloadPage as string}
                            //     target="_blank"
                            //     onClick={handleDownload}
                            //     rel="noreferrer"
                            // >
                                <button className="pt-6" onClick={handleDownload}>Download</button>
                            // </a>
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
