import React, {useState} from "react";
import {Image} from "@chakra-ui/image";

const NFTMedia = ({imageURL, setIsImageLoaded, type}) => {


    const onImageLoad = (ms: number) => {
        setTimeout(() => {
            setIsImageLoaded(true);
        }, ms);
    };

    const isVideo = (imageURL) => {
        console.log('imageUrl', imageURL)
        if (!imageURL) {
            return null;
        }
        setIsImageLoaded(true);
        const fileExtension = imageURL.split('.').pop();
        return fileExtension === 'mp4';
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