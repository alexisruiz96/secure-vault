import { IFile } from "../models/interfaces/interfaces";
import { getImage } from "./ImagesLoader";
import { sizeInMb } from "../utils/SizeInMb";

const RenderFile:React.FC<{
    file:IFile;
}> = ({file:{name, sizeInBytes, format}}) => {
    return (
        <div className="flex items-center w-full p-4 my-2">
            <img src={'/securevault-react-app/public/assets/' + format + '.png'} alt="" />
            <img src={getImage(format)} alt="" className="w-14 h-14"/>
            <span className="mx-2">{name}</span>
            <span className="ml-auto">{sizeInMb(sizeInBytes)}</span>
        </div>
    )

}

export default RenderFile;
