import React from 'react';

import { getImage} from '../utils/ImagesLoader';
// import { useNavigate } from 'react-router-dom';

//In the tutorial it shows how to create two different pages, one to see the link to
// to go to the download page and one to go to the download page.
// I have decided to create one page that shows the file that is uploaded.
// Also, it show 3 different buttons: upload new file, download and logout.
// When one file is uploaded and we navigate to it to upload a new file,
// it has to keep the old file as the one that is uploaded.
const DownloadFile: React.FC = () => {
    return (
        <div className='flex flex-col items-center justify-center py-3 space-y-4 rounded-md '>
            <img src={getImage('file_download')} alt="" className='w-16 h-16' />
            <h1 className='text-xl'>You can download your file</h1>
        </div>
    );
};

export default DownloadFile;
