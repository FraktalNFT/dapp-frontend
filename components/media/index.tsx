import React, {useState} from "react";
import {Image} from "@chakra-ui/image";

const NFTMedia = ({imageURL, setIsImageLoaded, type}) => {


    const onImageLoad = (ms: number) => {
        setIsImageLoaded(true);
    };

    const isVideo = (imageURL: string) => {
        if (!imageURL) {
            return null;
        }
        const fileExtension = imageURL.split('.').pop();
        if (fileExtension !== 'mp4') {
            return false;
        }
        setIsImageLoaded(true);
        return true;
    }

    return (
        <>
            {isVideo(imageURL) ? (
                 <video autoPlay loop muted>
                    <source src={imageURL} type="video/mp4"/>
                 </video>
                ) : (
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
                    onLoad={() => onImageLoad(50)}
                />)
            }

        </>
    )
}
export default NFTMedia;