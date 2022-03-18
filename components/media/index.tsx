import {Image} from "@chakra-ui/image";
import React from "react";

const onImageLoad = (ms: number) => {
    setTimeout(() => {
        setIsImageLoaded(true);
    }, ms);
};

const NFTMedia = ({imageURL}) => {


    return (
        <Image
            src={'https://image.fraktal.io/?height=350&image=' + encodeURIComponent(imageURL)}
            width="100%"
            height="100%"
            objectFit="cover"
            margin-left="auto"
            margin-right="auto"
            display="flex"
            sx={{
                objectFit: `cover`,
            }}
            style={{ verticalAlign: 'middle' }}
            onLoad={() => onImageLoad(5)}
        />
    )
}
export default NFTMedia;