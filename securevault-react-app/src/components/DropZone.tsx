import React, {useCallback} from 'react'
import {useDropzone} from 'react-dropzone'
import folder from '../assets/folder.png'



const MyDropzone: React.FC = () => {
    
    const onDrop = useCallback((acceptedFiles: any) => {
        console.log(acceptedFiles)
    } , [])
    const {getRootProps, getInputProps} = useDropzone({
        onDrop,
        multiple: false,
    })
    return (
        <div
            className='border-2 border-dashed border-yellow-400 rounded-xl mb-5'
        >
            <div 
                {...getRootProps()} 
                className="w-full h-80 rounded-md cursor-pointer focus:outline-none bg-slate-200"
            >
                <input {...getInputProps()} />
                <div className='justify-center items-center flex flex-col'>
                    <img src={folder} alt="folder" className="w-16 h-16 mt-3" />
                    <p className="text-center text-lg text-slate-500">
                        Drag 'n' drop some files here, or click to select files
                    </p>
                    <p className='mt-8 text-center text-slate-500'>
                        Only zips, png & jpg files are allowed
                    </p>
                </div>
            </div>

        </div>
    )
}

export default MyDropzone;