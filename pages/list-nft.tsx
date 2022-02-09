import FrakButton4 from "../components/button4";
import MintCard from "../components/mintCard";
import ListCardAuction from "../components/listCardAuction";
import ListCard from "../components/listCard";
import {
  VStack,
  Box,
  Stack,
  Grid,
  Text,
  Link,
  Checkbox,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Image as ImageComponent } from "@chakra-ui/image";
import { useWeb3Context } from "../contexts/Web3Context";
import { useUserContext } from "../contexts/userContext";
import { utils } from "ethers";
import {
  createNFT,
  approveMarket,
  importFraktal,
  getIndexUsed,
  listItem,
  listItemAuction,
  getApproved,
  importERC721,
  importERC1155,
} from "../utils/contractCalls";
import { pinByHash } from "../utils/pinataPinner";
import { useRouter } from "next/router";
import NFTItem from "../components/nft-item";
import { useMintingContext } from "@/contexts/NFTIsMintingContext";
import toast from "react-hot-toast";
import LoadScreen from '../components/load-screens';
import {awaitTokenAddress} from "../utils/helpers";/**
 * REDUX
 */
import {connect} from 'react-redux';
import {
    approvedTransaction,
    APPROVE_TOKEN,
    MINT_NFT,
    IMPORT_FRAKTAL,
    rejectContract,
} from "../redux/actions/contractActions";
const { create } = require("ipfs-http-client");
const MAX_FRACTIONS = 10000;

const MintPage = (props) => {
  const {mintNFTRejected, tokenRejected, transferRejected} = props;
  const { fraktals, nfts } = useUserContext();
  const { isMinting, setIsMinting } = useMintingContext();
  const router = useRouter();
  const { account, provider, marketAddress, factoryAddress } = useWeb3Context();
  const [ipfsNode, setIpfsNode] = useState();
  const [status, setStatus] = useState("mint");
  const [imageData, setImageData] = useState(null);
  const [imageSize, setImageSize] = useState([]);
  const [name, setName] = useState();
  const [description, setDescription] = useState();
  const [file, setFile] = useState();
  const [listItemCheck, setListItemCheck] = useState(true);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [minted, setMinted] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [fraktionalized, setFraktionalized] = useState(false);
  const [listed, setListed] = useState(false);
  const [tokenMintedAddress, setTokenMintedAddress] = useState();
  const [tokenToImport, setTokenToImport] = useState();
  const [nftApproved, setNftApproved] = useState(false);
  const [isAuction,setIsAuction] = useState(false);
  const [listingProcess, setListingProcess] = useState(false);
  const [isMintingFailed, setMitingFailed] = useState(false);
  const [txResponse, setTxResponse] = useState({});

  // detect states (where is NFT and if its ready to list so send it here for listing!)

  // FUNCTIONS FOR MINTING
  useEffect(() => {
    const ipfsClient = create({
      host: "ipfs.infura.io",
      port: "5001",
      protocol: "https",
    });
    setIpfsNode(ipfsClient);
  }, []);

  async function uploadAndPin(data) {
    let dataUpload;
    try {
      dataUpload = await ipfsNode.add(data);
    } catch (e) {
      console.error("Error: ", e);
      return "Error uploading the file";
    }
    await pinByHash(dataUpload.cid.toString()); // Pinata
    return dataUpload;
  }

  async function prepareNftData() {
    let results = await uploadAndPin(file);
    let metadata = {
      name: name,
      description: description,
      image: results.path,
    };
    await minter(metadata);
  }

  async function minter(metadata) {
    let metadataCid = await uploadAndPin(JSON.stringify(metadata));
    if (metadataCid) {
      setListingProcess(true);
      setIsMinting(true);
      let response = await createNFT(
        metadataCid.cid.toString(),
        provider,
        factoryAddress
      ).then(response => {
          if (!response?.error) {
              //TODO REMOVE TOAST
              // toast.success("Mint completed.");
              setIsMinting(false);
              setTokenMintedAddress(response);
              console.log('Approved');
              let mintingArray = [];
              if (window?.localStorage.getItem("mintingNFTS")) {
                  let mintingNFTSString = window?.localStorage.getItem("mintingNFTS");
                  let mintingNFTS = JSON.parse(mintingNFTSString);
                  mintingArray = [...mintingNFTS, response];
              } else {
                  mintingArray = [response];
              }
              let mintingArrayString = JSON.stringify(mintingArray);
              window?.localStorage.setItem("mintingNFTs", mintingArrayString);
              setMinted(true);
          }
        }
      ).catch(e => {
          setIsMinting(false);
          mintNFTRejected(e, prepareNftData);
      });
      if (response?.error) {
        mintNFTRejected(response?.error, prepareNftData);
        //TODO REMOVE TOAST
      //  toast.error("Transaction failed.");
        setIsMinting(false);
      }

    }
  }

  async function addFile() {
    const selectedFile = document.getElementById("imageInput").files[0];
    setFile(selectedFile);
    let reader = new FileReader();
    reader.readAsDataURL(selectedFile);
    reader.onloadend = function () {
      setImageData(reader.result);
      var image = new Image();
      image.src = reader.result;
      image.onload = function () {
        setImageSize(this.width, this.height);
      };
    };
  }

  const proportionalImage = width => {
    return (imageSize[1] / imageSize[0]) * width;
  };

  // FUNCTIONS FOR LISTING
  const fraktalReady =
    minted &&
    totalAmount > 0 &&
    totalAmount <= MAX_FRACTIONS &&
    totalPrice > 0 &&
    isApproved &&
    fraktionalized;

  async function approveToken() {
    await approveMarket(marketAddress, provider, tokenMintedAddress)
        .then(
      () => {
        setIsApproved(true);
        importFraktalToMarket();
      }
    ).catch(error => {
       tokenRejected(error, approveToken);
    });
  }

  async function importFraktalToMarket() {
    let index = 0;
    let isUsed = true;
    while (isUsed == true) {
      index += 1;
      isUsed = await getIndexUsed(index, provider, tokenMintedAddress);
    }
    if (isUsed == false) {
      await importFraktal(
        tokenMintedAddress,
        index,
        provider,
        marketAddress
      ).then(() => {
        setFraktionalized(true);
        if(isAuction){
          listNewAuctionItem();
        }
        else{
          listNewItem();
        }
      }).catch(error => {
          transferRejected(error, importFraktalToMarket);
      });
    }
  }

  async function approveNFT() {
    if (tokenToImport && tokenToImport.id) {
      let res = await approveMarket(factoryAddress, provider, tokenToImport.id);
      if (res) {
        setNftApproved(true);
      }
    }
  }

  async function importNFT() {
    let address;
    if (tokenToImport.token_schema == "ERC721") {
      address = await importERC721(
        parseInt(tokenToImport.tokenId),
        tokenToImport.id,
        provider,
        factoryAddress
      );
    } else {
      address = await importERC1155(
        parseInt(tokenToImport.tokenId),
        tokenToImport.id,
        provider,
        factoryAddress
      );
    }
    if (address) {
      setTokenMintedAddress(address);
      setMinted(true);
    }
  }

  useEffect(()=>{
    // const pricePerFei = utils.parseUnits(totalPrice).div(utils.parseUnits(totalAmount));
    // console.log(`price:${totalPrice},amount:${totalAmount}`);
  })

  async function listNewItem() {
    const wei = utils.parseEther(totalPrice.toString());
    const fei = utils.parseEther(totalAmount.toString());
    const weiPerFrak = (wei.mul(utils.parseEther("1.0"))).div(fei);

    // const weiPerFrak = utils.parseEther(totalPrice.toString()).div(utils.parseUnits(totalAmount.toString()));
    // console.log("price",weiPerFrak.toString());
    //TODO - REMOVE CONSOLE LOG
    console.log('listItem');
    listItem(
      tokenMintedAddress,
      fei,//shares
      weiPerFrak,//price
      provider,
      marketAddress
    ).then(() => {
        setInterval(() => {
            router.push('/');
        }, 1000);
    }).catch(error => {
      mintNFTRejected(error, listNewItem);
    });
  }
  async function listNewAuctionItem() {
    //TODO - REMOVE CONSOLE LOG
    console.log('Auction');

    listItemAuction(
      tokenMintedAddress,
      utils.parseUnits(totalPrice),
      utils.parseUnits(totalAmount),
      provider,
      marketAddress
    ).then(() => {
        setInterval(() => {
            router.push('/');
        }, 1000);
    }).catch(error => {
        mintNFTRejected(error, listNewAuctionItem);
    });;
  }


  useEffect(() => {
    if (listItemCheck && tokenMintedAddress) {
      approveToken();
    }
  }, [tokenMintedAddress]);

  let msg = () => {
    if (!minted) {
      return "";
    } else if (minted && !isApproved) {
      return "";
    } else if (minted && isApproved && !fraktionalized) {
      return "";
    } else {
      return "";
    }
  };

  return (
    <div>
      <LoadScreen />
      <Box
        sx={{
          display: `grid`,
          gridTemplateColumns: `400px 621px`,
          columnGap: `16px`,
        }}
      >
        <Box sx={{ position: `relative` }}>
          <VStack marginRight="53px" sx={{ position: `sticky`, top: `20px` }}>
            <div
              style={{
                fontWeight: 800,
                fontSize: "48px",
                lineHeight: "64px",
                color: "black",
              }}
            >
              Mint NFT
            </div>
            <div
              style={{
                marginTop: "24px",
                marginBottom: "16px",
                fontWeight: 600,
                fontSize: "12px",
                lineHeight: "14px",
                letterSpacing: "1px",
                color: "#656464",
              }}
            >
              PREVIEW
            </div>
            <ImageComponent
              src={imageData ? imageData : null}
              w="400px"
              h={imageData ? proportionalImage(400) : "400px"}
              style={{ borderRadius: "4px 4px 0px 0px", objectFit: `cover` }}
            />
            <div
              style={{
                fontWeight: "bold",
                fontSize: "16px",
                lineHeight: "19px",
                color: "#000000",
              }}
            >
              {name ? name : "name"}
            </div>
          </VStack>
        </Box>
        <Stack spacing="0" mb="12.8rem">
          <div style={{ marginBottom: "24px", display: `flex`, gap: `16px` }}>
            <Link
              className="semi-16"
              borderRadius="25"
              padding="5"
              sx={{
                backgroundColor: `black`,
                color: `white`,
                border: `2px solid transparent`,
              }}
              _hover={{ color: `white` }}
              onClick={() => null}
            >
              Mint NFT
            </Link>
            <Link
              className="semi-16"
              borderRadius="25"
              padding="5"
              _hover={{ bg: "black", textColor: "white" }}
              onClick={() => router.push("/import-nft")}
            >
              Import NFT
            </Link>
          </div>
          <div>
            <MintCard
              setName={setName}
              setDescription={setDescription}
              addFile={addFile}
              file={file}
            />
          </div>
          <div style={{ marginTop: "16px" }}>
            <Box
              sx={{
                display: `flex`,
                gap: `12px`,
                alignItems: `center`,
                marginBottom: `8px`,
              }}
            >
              {listItemCheck && (
                <Box
                  sx={{
                    width: `16px`,
                    height: `16px`,
                    borderRadius: `4px`,
                    display: `block`,
                    backgroundColor: `#00C49D`,
                  }}
                  _hover={{
                    cursor: `pointer`,
                  }}
                  onClick={() => setListItemCheck(!listItemCheck)}
                ></Box>
              )}
              {!listItemCheck && (
                <Box
                  sx={{
                    width: `16px`,
                    height: `16px`,
                    borderRadius: `4px`,
                    border: `2px solid rgba(0,0,0,0.3)`,
                    display: `block`,
                  }}
                  _hover={{
                    cursor: `pointer`,
                  }}
                  onClick={() => setListItemCheck(!listItemCheck)}
                ></Box>
              )}
              <Text
                sx={{
                  fontSize: `16px`,
                  fontFamily: `Inter, sans-serif`,
                  fontWeight: `700`,
                }}
                _hover={{
                  cursor: `pointer`,
                }}
                onClick={() => setListItemCheck(!listItemCheck)}
              >
                Sell Fraktions
              </Text>
            </Box>
            <div>
              {listItemCheck && (
                <Tabs isFitted variant='enclosed'
                onChange={(e)=>setIsAuction(!isAuction)}
                >
                  <TabList mb='1em'>
                    <Tab
                    >Fixed Price</Tab>
                    <Tab
                    >Auction</Tab>
                  </TabList>
                  <TabPanels>
                    <TabPanel>
                <ListCard
                  totalPrice={totalPrice}
                  setTotalPrice={setTotalPrice}
                  setTotalAmount={setTotalAmount}
                  listingProcess={listingProcess}
                  maxFraktions={MAX_FRACTIONS}
                />
                </TabPanel>
                <TabPanel>
                <ListCardAuction
                    totalPrice={totalPrice}
                    setTotalPrice={setTotalPrice}
                    setTotalAmount={setTotalAmount}
                    listingProcess={listingProcess}
                    maxFraktions={MAX_FRACTIONS}
                  />
                </TabPanel>
              </TabPanels>
            </Tabs>
              )}
            </div>
          </div>
          <div
            style={{
              marginTop: "24px",
              justifyItems: "space-between",
              display: `flex`,
              gap: `16px`,
            }}
          >
            <FrakButton4
              status={!minted ? "open" : "done"}
              disabled={!name || !imageData}
              onClick={() => prepareNftData()}
            >
              1. Mint
            </FrakButton4>
            {listItemCheck && (
              <>
                <FrakButton4
                  status={!isApproved ? "open" : "done"}
                  disabled={!tokenMintedAddress}
                  onClick={() => approveToken()}
                >
                  2. Approve
                </FrakButton4>
                <FrakButton4
                  status={!fraktionalized ? "open" : "done"}
                  disabled={!isApproved || !tokenMintedAddress }
                  onClick={() => importFraktalToMarket()}
                >
                  3. Transfer
                </FrakButton4>
                <FrakButton4
                  status={!listed ? "open" : "done"}
                  disabled={!fraktalReady}
                  onClick={() => {
                    if(isAuction){
                      listNewAuctionItem();
                    }else{
                      listNewItem()
                    }
                  }
                  }
                >
                  4. {isAuction?"List Auction":"List"}
                </FrakButton4>
              </>
            )}
          </div>
          <div
            style={{
              marginTop: "16px",
              color: "#405466",
              fontSize: "16px",
              fontWeight: 600,
              lineHeight: "19px",
            }}
          >
            {msg()}
          </div>
        </Stack>
      </Box>
    </div>
  );
};

const mapStateToProps = (state) => {
    return {
        contractTransaction: state.loadingScreen
    }
};

const mapDispatchToProps = (dispatch) => {
    return {
        mintNFTRejected: (obj, buttonAction) => {
            dispatch(rejectContract(MINT_NFT, obj, buttonAction))
        },
        tokenRejected: (obj, buttonAction) => {
            dispatch(rejectContract(APPROVE_TOKEN, obj, buttonAction))
        },
        transferRejected: (obj, buttonAction) => {
            dispatch(rejectContract(IMPORT_FRAKTAL, obj, buttonAction))
        },
        mintNFTApproved: (obj, receipt ) => {
            dispatch(approvedTransaction(MINT_NFT, obj, receipt))
        },
    }
};
export default connect(mapStateToProps, mapDispatchToProps)(MintPage);