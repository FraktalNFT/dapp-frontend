import React, {useState, useEffect} from "react";
import {Image} from "@chakra-ui/image";

const NFTMedia = ({imageURL, setIsImageLoaded, type}) => {

    const [isImageLoading, setIsImageLoading] = useState<boolean>(true);
    const [image, setImage] = useState<string>("true");

    async function loadImage() {
        console.log('load')
        try {
            const loadImage = await fetch(imageURL);
            console.log('loadImage', loadImage.headers.get('content-type') )
            if (loadImage.headers.get('content-type') != 'image/gif') {
                console.log(imageURL)
                setImage('https://image.fraktal.io/?height=350&image=' + encodeURIComponent(imageURL));
            } else {
                console.log('imageURL', imageURL)
                setImage(imageURL);
                setIsImageLoaded(true);
            }
        } catch (e) {
            console.log(e)
        }
        //  console.log(loadImage.headers.get('content-type'))
    }
    useEffect(() => {
        console.log(type)
        if (type == 'details') {
            loadImage();
        } else {
            setImage('https://image.fraktal.io/?height=350&image=' + encodeURIComponent(imageURL));
        }
    }, []);

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
                image && <Image
                    src={image}
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