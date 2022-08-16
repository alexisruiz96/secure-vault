import { ImageLoaderProps } from "../models/interfaces/interfaces";
import copy_png from "../assets/copy.png";
import doc_png from "../assets/doc.png";
import file_download__png from "../assets/file-download.png";
import folder_png from "../assets/folder.png";
import jpeg_png from "../assets/jpeg.png";
import jpg_png from "../assets/jpg.png";
import mp3_png from "../assets/mp3.png";
import mpeg_png from "../assets/mpeg.png";
import png_png from "../assets/png.png";
import txt_png from "../assets/txt.png";



const images: ImageLoaderProps = {
    items: {
        'copy': copy_png,
        'doc': doc_png,
        'file_download': file_download__png,
        'folder': folder_png,
        'jpeg': jpeg_png,
        'jpg': jpg_png,
        'mp3': mp3_png,
        'mpeg': mpeg_png,
        'png': png_png,
        'txt': txt_png
    }
}
 
    
    
export const getImage = (extension: string) =>{
    if(typeof extension === 'undefined'){
        return undefined;
    }
    else{
        return images.items[extension]
    }
}
