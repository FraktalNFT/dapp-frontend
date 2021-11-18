import FrakButton4 from "../components/button4";
import MintCard from "../components/mintCard";
import ListCard from "../components/listCard";
import { VStack, Box, Stack, Grid } from "@chakra-ui/layout";
import { Link, Checkbox } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Image as ImageComponent }  from "@chakra-ui/image";
import { useWeb3Context } from "../contexts/Web3Context";
import { useUserContext } from "../contexts/userContext";
import { utils } from "ethers";
import {
  createNFT,
  approveMarket,
  importFraktal,
  getIndexUsed,
  listItem,
  getApproved,
  approveContract,
  importERC721,
  importERC1155
} from "../utils/contractCalls";
import { pinByHash } from '../utils/pinataPinner';
import { useRouter } from "next/router";
import NFTItem from '../components/nft-item';

const { create } = require('ipfs-http-client');

export default function MintPage() {
  const { fraktals, nfts } = useUserContext();
  const router = useRouter();
  const { account, provider, marketAddress, factoryAddress } = useWeb3Context();
  const [ipfsNode, setIpfsNode] = useState();
  const [status, setStatus] = useState('mint');
  const [imageData, setImageData] = useState(null);
  const [imageSize, setImageSize] = useState([]);
  const [name, setName] = useState();
  const [description, setDescription] = useState();
  const [file, setFile] = useState();
  const [listItemCheck, setListItemCheck] = useState(true);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0.);
  const [minted, setMinted] = useState(false);
  const [fraktionalized, setFraktionalized] = useState(false);
  const [listed, setListed] = useState(false);//not used..
  const [tokenMintedAddress, setTokenMintedAddress] = useState();
  const [tokenToImport, setTokenToImport] = useState();

  // detect states (where is NFT and if its ready to list so send it here for listing!)
  const [marketApproved, setMarketApproved] = useState(false);
  const [factoryApproved, setFactoryApproved] = useState(false);

useEffect(async () => {
  if(tokenMintedAddress){
    let marketApproval = await getApproved(
      account,
      marketAddress,
      provider,
      tokenMintedAddress
    );
    if(marketApproval){
      setMarketApproved(marketApproval)
    }
  }
},[tokenMintedAddress]);

useEffect(async () => {
  if(tokenToImport){
    let factoryApproval = await getApproved(
      account,
      factoryAddress,
      provider,
      tokenToImport.id
    );
    if(factoryApproval){
      setFactoryApproved(factoryApproval)
    }
  }
},[tokenToImport]);

// FUNCTIONS FOR MINTING
useEffect(()=>{
  const ipfsClient = create({
    host: "ipfs.infura.io",
    port: "5001",
    protocol: "https",})
    setIpfsNode(ipfsClient)
  },[])

async function uploadAndPin(data){
  let dataUpload
  try{
    dataUpload = await ipfsNode.add(data);
  }catch(e){
    console.log('Error: ',e)
    return 'Error uploading the file'
  }
  await pinByHash(dataUpload.cid.toString()) // Pinata
  return dataUpload;
}
async function prepareNftData(){
  let results = await uploadAndPin(file)
  let metadata = {name:name, description:description, image:results.path}
  minter(metadata)
}
async function minter(metadata) {
  let metadataCid =  await uploadAndPin(JSON.stringify(metadata))
  if(metadataCid){
    createNFT(metadataCid.cid.toString(), provider, factoryAddress).then(res => {
      setTokenMintedAddress(res)
      setMinted(true);
    });
  }
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


// FUNCTIONS FOR LISTING
  const fraktalReady = tokenMintedAddress
    && totalAmount > 0
    && totalAmount <= 10000
    && totalPrice > 0
    && marketApproved;

  async function approveToken() {
    await approveMarket(marketAddress, provider, tokenMintedAddress).then(()=>{
      setMarketApproved(true);
    })
  }

  async function importFraktalToMarket(){
    let index = 0;
    let isUsed = true;
    while(isUsed == true){
      index += 1;
      isUsed = await getIndexUsed(index, provider, tokenMintedAddress);
    }
    if(isUsed == false){
      await importFraktal(tokenMintedAddress,index,provider,marketAddress).then(() => {
        setFraktionalized(true);
      });
    }
  }

  async function approveNFT(){
    if(tokenToImport && tokenToImport.id){
      let res = await approveMarket(factoryAddress, provider, tokenToImport.id);
      if(res){
        setFactoryApproved(true)
      }
    }
  }

  async function importNFT(){
    let address;
    if(tokenToImport.token_schema == 'ERC721'){
      address = await importERC721(parseInt(tokenToImport.tokenId), tokenToImport.id, provider, factoryAddress)
    } else {
      address = await importERC1155(parseInt(tokenToImport.tokenId), tokenToImport.id, provider, factoryAddress)
    }
    if(address){
      setTokenMintedAddress(address);
      setMinted(true);
    }
  }

  async function listNewItem(){
    listItem(
      tokenMintedAddress,
      totalAmount,
      utils.parseUnits(totalPrice).div(totalAmount),
      provider,
      marketAddress).then(()=>{
        router.push('/');
      })
  }

  let msg = () => {
    if(!minted){
      return 'Mint your new token to start the process of Fraktionalization and Listing.'
    }else if(minted && !marketApproved){
      return 'NFT succesfully minted! Approve the transfer of your Fraktal NFT and future Fraktions transfers.'
    }else if(minted && marketApproved && !fraktionalized){
      return 'Transfer rights granted! Now transfer your Fraktal NFT to the Marketplace. The Fraktions will remain in your wallet.'
    }else{
      return 'Fraktal NFT received! List your Fraktions on the Marketplace. If someone buys your Fraktions the Marketplace contract will transfer them'
    }
  }

  return (
    <div>
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
            _active={{bg: "black", textColor: "white"}}
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
        <div>
        {status == 'mint' ?
          <MintCard
            setName = {setName}
            setDescription = {setDescription}
            addFile = {addFile}
            file = {file}
          />
          :
          <div>
          {!tokenToImport && !tokenMintedAddress ?
            <div>
            SELECT AN NFT FROM YOUR WALLET
            {fraktals && fraktals.length &&
              <div>Your Fraktals
              <div>
                <Grid
                  mt='40px !important'
                  ml='0'
                  mr='0'
                  mb='5.6rem !important'
                  w='100%'
                  templateColumns='repeat(3, 1fr)'
                  gap='3.2rem'
                >
                  {fraktals.map(item => (
                    <div
                      onClick={()=>{
                        setTokenMintedAddress(item.id)
                        setName(item.name)
                        setImageData(item.imageURL)
                      }}
                      key={item.id+'-'+item.tokenId}
                    >
                      <NFTItem
                        item={item}
                        name={item.name}
                        amount={null}
                        price={null}
                        imageURL={item.imageURL}
                      />
                    </div>
                  ))}
                </Grid>
              </div>
              </div>
            }
            {nfts && nfts.length &&
              <div>
                <div>Your wallet NFT's
                <Grid
                mt='40px !important'
                ml='0'
                mr='0'
                mb='5.6rem !important'
                w='100%'
                templateColumns='repeat(3, 1fr)'
                gap='3.2rem'
                >
                {nfts.map(item => (
                  <div
                    key={item.id+'-'+item.tokenId}
                    onClick={()=>{
                      setTokenToImport(item)
                      setImageData(item.imageURL)
                      setName(item.name)
                    }}
                  >
                    <NFTItem
                      item={item}
                      name={item.name}
                      amount={null}
                      price={null}
                      imageURL={item.imageURL}
                    />
                  </div>
                ))}
                </Grid>
                </div>
            </div>
            }
            </div>
            :
            <div>
              <div onClick={()=>{
                setTokenToImport(null)
                setTokenMintedAddress(null)
                setName(null)
                setImageData(null)
              }}>Go Back</div>
            </div>

          }
          </div>
        }
        </div>
          <div style={{marginTop: '16px'}}>
            <Checkbox
              isChecked = {listItemCheck}
              onChange = {() => setListItemCheck(!listItemCheck)}
              size = 'lg'
            >List your Fraktions for sale</Checkbox>
            <div>
              {listItemCheck &&
                <ListCard
                totalPrice = {totalPrice}
                setTotalPrice = {setTotalPrice}
                setTotalAmount = {setTotalAmount}
                />
              }
            </div>
          </div>
          <div style={{marginTop: '24px', justifyItems: 'space-between'}}>
          {status == 'mint' ?
            <FrakButton4
              status = {!minted ? 'open' : 'done'}
              disabled = {!name || !imageData}
              onClick = {()=>prepareNftData()}
            >
            1. Mint
            </FrakButton4>
            :
            <div>
              <FrakButton4
                status = {!factoryApproved ? 'open' : 'done'}
                disabled = {!tokenToImport || !tokenToImport.id}
                onClick = {()=>approveNFT()}
              >
              1.1 Approve NFT
              </FrakButton4>
              <FrakButton4
                status = {!minted ? 'open' : 'done'}
                disabled = {!factoryApproved}
                onClick = {()=>importNFT()}
              >
              1.2 Import
              </FrakButton4>
            </div>
            }
            <FrakButton4
              status = {!marketApproved ? 'open' : 'done'}
              disabled = {!tokenMintedAddress}
              onClick = {()=>approveToken()}
            >
            2. Approve
            </FrakButton4>
            <FrakButton4
              status = {!fraktionalized ? 'open' : 'done'}
              disabled = {!marketApproved || !tokenMintedAddress}
              onClick = {()=>importFraktalToMarket()}
            >
            3. Transfer
            </FrakButton4>
            <FrakButton4
              status = {!listed ? 'open' : 'done'}
              disabled = {!fraktalReady}
              onClick = {()=>listNewItem()}
            >
            4. List
            </FrakButton4>
          </div>
          <div style={{
            marginTop: '16px',
            color: '#405466',
            fontSize: '16px',
            fontWeight: 600,
            lineHeight: '19px'
          }}>
          {msg()}
          </div>
        </Stack>
      </Box>
    </div>
  );
}
