import React from 'react';

import { getImage } from '../utils/ImagesLoader';
import { i18n } from '../i18n/i18n';

const DownloadFile: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center py-3 space-y-4 rounded-md ">
            <img src={getImage("file_download")} alt="" className="w-16 h-16" />
            <h1 className="text-xl">{i18n.download_info}</h1>
        </div>
    );
};

export default DownloadFile;
