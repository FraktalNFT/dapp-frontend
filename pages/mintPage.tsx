// import Link from "next/link";
// import { utils } from "ethers";
import FrakButton3 from "../components/button3";
import FrakButton4 from "../components/button4";
import styles from "../styles/mint-nft.module.css";
import { VStack, Box, Stack } from "@chakra-ui/layout";
import { Link } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Image as ImageComponent }  from "@chakra-ui/image";
import { useWeb3Context } from "../contexts/Web3Context";
import {
  createNFT
} from "../utils/contractCalls";
import { useRouter } from "next/router";
import { CONNECT_BUTTON_CLASSNAME } from "web3modal";

export default function MintPage() {
  const router = useRouter();
  const { account, provider, marketAddress, factoryAddress } = useWeb3Context();
  const [status, setStatus] = useState('mint');
  const [nftObject, setNftObject] = useState({});
  const [imageData, setImageData] = useState(null);
  const [imageSize, setImageSize] = useState([]);
  const [name, setName] = useState();
  const [description, setDescription] = useState();
  const [file, setFile] = useState();

  function openLocal(){
    document.getElementById('imageInput').files = null;
    document.getElementById('imageInput').click()
  }
  async function addFile(){
    const selectedFile = document.getElementById('imageInput').files[0];
    setFile(selectedFile)
    let reader = new FileReader();
    reader.readAsDataURL(selectedFile);
    reader.onloadend = function () {
      setImageData(reader.result)
      var image = new Image();
      image.src = reader.result;
      image.onload = function() {
        setImageSize(this.width, this.height)
      }
    }
  }
  const proportionalImage = (width) => {return (imageSize[1]/imageSize[0])*width}

  return (
    <Box
      sx={{
        display: `grid`,
        gridTemplateColumns: `400px 621px`,
        columnGap: `16px`,
      }}
    >
      <Box sx={{ position: `relative` }}>

        <VStack marginRight="53px" sx={{ position: `sticky`, top: `20px` }}>
          <div style={{
            fontWeight: 800,
            fontSize: '48px',
            lineHeight: '64px',
            color: '#000000',
          }}>Mint NFT</div>
          <div style={{
            marginTop: '24px',
            marginBottom: '16px',
            fontWeight: 600,
            fontSize: '12px',
            lineHeight: '14px',
            letterSpacing: '1px',
            color: '#656464',
          }}>PREVIEW</div>
          <ImageComponent
            src={imageData ? imageData : null}
            w="400px"
            h={imageData ? proportionalImage(400) : '400px'}
            style={{ borderRadius: "4px 4px 0px 0px", objectFit: `cover` }}
          />
          <div style={{
            fontWeight: 'bold',
            fontSize: '16px',
            lineHeight: '19px',
            color: '#000000'
          }}>
            {name ? name : 'name'}
          </div>
        </VStack>
      </Box>
      <Stack spacing="0" mb="12.8rem">
        <div style={{marginBottom: '24px'}}>
          <Link
            className='semi-16'
            borderRadius='25'
            padding='5'
            _hover={{bg: "black", textColor: "white"}}
            onClick={()=>setStatus('mint')}
          >Mint NFT</Link>
          <Link
            className='semi-16'
            borderRadius='25'
            padding='5'
            _hover={{bg: "black", textColor: "white"}}
            onClick={()=>setStatus('import')}
          >Import NFT</Link>
        </div>
        { status == 'mint' &&
          <div>
            <div style={{
              fontSize:'12px',
              lineHeight: '14px',
              fontWeight: 600,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              color: '#656464'
            }}>NAME</div>
            <input
              className={styles.input}
              id="nameIn"
              placeholder = "Give your NFT a Unique and Catchy Name"
              onChange={(e)=>setName(e.target.value)}
            />
            <div>
              <div style={{
                fontSize:'12px',
                lineHeight: '14px',
                marginTop: '24px',
                fontWeight: 600,
                letterSpacing: '1px',
                textTransform: 'uppercase',
                color: '#656464'
              }}>image</div>
              <FrakButton3
                style={{marginTop: ''}}
                isReady={true}
                onClick={()=> openLocal()}
                setFunction={()=> addFile()}
                inputPlaceholder = 'PNG, GIF, WEBP, MP4 or MP3'
              >
                {file ? "Change image" : "Choose image"}
              </FrakButton3>
            </div>
            <div
              style={{
                fontSize:'12px',
                lineHeight: '14px',
                marginTop: '55px',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                color: '#656464',
                fontWeight: 600
              }}
            >
              DESCRIPTION (OPTIONAL)
            </div>
            <input
            className={styles.input}
            id="descriptionIn"
            placeholder="Write something about your NFT  "
            onChange={(e)=>setDescription(e.target.value)}
            />
          </div>
        }

        <div>
          checkbox for listing
        </div>
        <div>
          inputs for listing
        </div>
        <div>
          <FrakButton4
            status = {name ? 'open' : 'done'}
            disabled = {!name || !imageData}
            onClick = {()=>console.log('create NFT')}
          >
          1. Mint
          </FrakButton4>
          <FrakButton4
            status = {name ? 'open' : 'done'}
            disabled = {true}
            onClick = {()=>console.log('create NFT')}
          >
          2. Fraktionalize
          </FrakButton4>
          <FrakButton4
            status = {name ? 'open' : 'done'}
            disabled = {true}
            onClick = {()=>console.log('create NFT')}
          >
          3. List
          </FrakButton4>
        </div>

      </Stack>
      {/*
      <Modal
        open={txInProgress}
        onClose={()=>setTxInProgress(false)}
      >
        Tx's in course!
      </Modal>
    */}
    </Box>
  );
}
