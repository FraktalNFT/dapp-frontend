import React, {useState, useEffect} from "react";
import {Image} from "@chakra-ui/image";

const NFTMedia = ({imageURL, setIsImageLoaded, type, metadata={}}) => {

    const [isImageLoading, setIsImageLoading] = useState<boolean>(true);
    const [image, setImage] = useState<string>("");
    const [video, setVideo] = useState<string>("");

    async function loadMedia() {
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
        if (type == 'details') {
            loadVideo()
         //   loadMedia();
        } else {
           // setImage('https://image.fraktal.io/?height=350&image=' + encodeURIComponent(imageURL));
        }
    }, []);

    const onImageLoad = (ms: number) => {
        setIsImageLoaded(true);
    };

    const loadVideo = () => {
        if (!imageURL) {
            return null;
        }
        if (metadata.metadata.animation_url) {
            setVideo(metadata.metadata.animation_url);
            return true;
        }
        const fileExtension = imageURL.split('.').pop();
        if (fileExtension === 'mp4') {
            setVideo(imageURL);
            return true;
        }
    }

    const isVideo = () => {
        if (video === "") {
            return false;
        }
        console.log('video', 'true')
        setIsImageLoaded(true);
        return true;
    }

    return (
        <>
            {isVideo ? (
                 <video autoPlay loop muted>
                    <source src={video} type="video/mp4"/>
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