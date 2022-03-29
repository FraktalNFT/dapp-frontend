import React, {useState, useEffect} from "react";
import {Image} from "@chakra-ui/image";
import {Box, Spinner} from "@chakra-ui/react";

const NFTMedia = ({imageURL, setIsImageLoaded, type, metadata={}}) => {

    const [image, setImage] = useState<string>('https://image.fraktal.io/?height=350&image=' + encodeURIComponent(imageURL));
    const [video, setVideo] = useState<string>("");

    async function loadMedia() {
        try {
            const loadImage = await fetch(imageURL);
            if (loadImage.headers.get('content-type') == 'image/gif') {
                setImage(imageURL);
            }
            setIsImageLoaded(true);
        } catch (e) {
            //TODO - Add Error
        }
    }

    useEffect(() => {
        loadVideo();
        if (type == 'details') {
            loadMedia();
        }
    }, []);

    const onImageLoad = (ms: number) => {
        setIsImageLoaded(true);
    };

    const loadVideo = () => {
        if (!imageURL) {
            return null;
        }
        const fileExtension = imageURL.split('.').pop();
        if (fileExtension === 'mp4') {
            setVideo(imageURL);
            return true;
        }
        if (!metadata.metadata) {
            return false;
        }
        if (metadata.metadata.animation_url) {
            if (metadata.metadata.animation_url.startsWith('ipfs://')) {
                let hasIpfsProtocol = metadata.metadata.animation_url.split('ipfs://');
                setVideo('https://ipfs.io/ipfs/' + hasIpfsProtocol[1]);
            } else {
                setVideo(metadata.metadata.animation_url);
            }
            return true;
        }
        if (metadata.metadata.properties && metadata.metadata.properties.preview_media_file2 && metadata.metadata.properties.preview_media_file2_type.description == 'mp4') {
            setVideo(metadata.metadata.properties.preview_media_file2.description);
            return true;
        }
    };

    const isVideo = () => {
        if (video === "") {
            return false;
        }
        setIsImageLoaded(true);
        return true;
    };

    return (
        <>
            {isVideo() ? (
                 <video autoPlay loop muted>
                    <source src={video} type="video/mp4"/>
                 </video>
                ) : (
                <Image
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