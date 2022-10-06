import React, { Dispatch, useCallback, useRef } from 'react';
import { Accept, useDropzone } from 'react-dropzone';

import folder from '../assets/folder.png';
import { i18n } from '../i18n/i18n';

const MyDropzone: React.FC<{ setFile: Dispatch<File> }> = ({ setFile }) => {
    const acceptedFileTypes: Accept = {
        // "image/png": [".png"],
        "application/json": [".json"],
    };
    const inputFile = useRef<HTMLInputElement>(null);
    const onDrop = useCallback(
        (acceptedFiles: any) => {
            if(acceptedFiles.length > 0) {
                console.log(acceptedFiles);
                setFile(acceptedFiles[0]);
            }
        },
        [setFile]
    );
    
    //TODO add file control to check when file has been selected
    const { getRootProps, getInputProps, isDragAccept, isDragReject } =
        useDropzone({
            onDrop,
            multiple: false,
            accept: acceptedFileTypes,
        });
    return (
        <div
            className={
                "border-2 border-dashed border-gray-500 rounded-xl mb-5 hover:border-blue-500 " +
                (isDragAccept ? " border-green-500" : "") +
                (isDragReject ? " border-red-500" : "")
            }
            onClick={() => inputFile.current!.click()}
        >
            <div
                {...getRootProps()}
                className="w-full h-80 rounded-md cursor-pointer focus:outline-none bg-slate-200"
            >
                <input {...getInputProps()} ref={inputFile} />

                <div className="justify-center items-center flex flex-col">
                    <img src={folder} alt="folder" className="w-16 h-16 mt-3" />
                    {isDragReject ? (
                        <p>{i18n.dropzone_error_types}</p>
                    ) : (
                        <div>
                            <p className="text-center text-lg text-slate-500">
                                {i18n.dropzone_info}
                            </p>
                            <p className="mt-8 text-center text-slate-500">
                                {i18n.dropzone_error}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyDropzone;
