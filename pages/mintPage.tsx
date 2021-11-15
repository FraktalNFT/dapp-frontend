// import Link from "next/link";
// import { utils } from "ethers";
import FrakButton4 from "../components/button4";
import MintCard from "../components/mintCard";
import ListCard from "../components/listCard";
import { VStack, Box, Stack } from "@chakra-ui/layout";
import { Link, Checkbox } from "@chakra-ui/react";
// import { Checkbox, CheckboxGroup } from "@chakra-ui/react"
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
  const [imageData, setImageData] = useState(null);
  const [imageSize, setImageSize] = useState([]);
  const [name, setName] = useState();
  const [description, setDescription] = useState();
  const [file, setFile] = useState();
  const [listItemCheck, setListItemCheck] = useState(true);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0.);

// FUNCTIONS FOR MINTING, LISTING

// HANDLE IMPORT NFT's ()

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
        { status == 'mint' ?
          <MintCard
            setName = {setName}
            setDescription = {setDescription}
            addFile = {addFile}
            file = {file}
          />
          :
          <div>Select the nft to import</div>
        }
        <div
          style = {{
            fontSize: '16px',
            fontWeight: 500,
            lineHeight: '19px',
            color: '#000000',
            marginTop: '8.5px',
          }}
        >
          <Checkbox
            isChecked = {listItemCheck}
            onChange = {() => setListItemCheck(!listItemCheck)}
            size = 'lg'
          >List your Fraktions for sale</Checkbox>
        </div>
        <div>
          {listItemCheck &&
            <ListCard
            totalPrice = {totalPrice}
            setTotalPrice = {setTotalPrice}
            setTotalAmount = {setTotalAmount}
            />
          }
        </div>
        <div style={{marginTop: '24px', justifyItems: 'space-between'}}>
          <FrakButton4
            status = {name ? 'open' : 'done'}
            disabled = {!name || !imageData}
            onClick = {()=>console.log('create NFT')}
          >
          {status == 'mint' ? `1. Mint` : `1. Import`}
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
