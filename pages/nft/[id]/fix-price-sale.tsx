import { HStack, VStack } from "@chakra-ui/layout";
import React, {useEffect, useState} from "react";
import Head from "next/head";
import Link from "next/link";
import { utils } from "ethers";
import FrakButton from '../../../components/button';
import Button from "../../../components/button";
import { Image } from "@chakra-ui/image";
import styles from "./auction.module.css";
import {shortenHash, timezone, getParams} from '../../../utils/helpers';
import { getSubgraphData } from '../../../utils/graphQueries';
import { createListed } from '../../../utils/nftHelpers';
import { useWeb3Context } from '../../../contexts/Web3Context';
import { buyFraktions, makeOffer, claimFraktalSold } from '../../../utils/contractCalls';
import { useRouter } from 'next/router';

export default function FixPriceNFTView() {
  const router = useRouter();
  const {account, provider, marketAddress} = useWeb3Context();
  const [fraktalOwners, setFraktalOwners] = useState(1);
  const [nftObject, setNftObject] = useState();
  const [fraktionsToBuy, setFraktionsToBuy] = useState(0);
  const [valueSetter, setValueSetter] = useState(false);
  const [offerValue, setOfferValue] = useState('0');
  const [isOfferer, setIsOfferer] = useState(false);
  const [minOffer, setMinOffer] = useState(0.);
  const [itemSold, setItemSold] = useState(false);

// use callbacks
  useEffect(async ()=>{
      const address = getParams('nft');
      const index = address.split('/fix-price-sale')[0]
      let obj = await getSubgraphData('listed_itemsId',index)
      if(obj && account){
        if(obj && obj.listItems){
          setFraktalOwners(obj.listItems[0].fraktal.fraktions.length)
          let nftObjects = await createListed(obj.listItems[0])
          if(nftObjects && marketAddress){
            setNftObject(nftObjects)
          }
          if(obj.listItems[0].fraktal.offers.length){
            let findSold = obj.listItems[0].fraktal.status == 'sold'
            if(findSold){
              setItemSold(true);
            }
            let findOffer = obj.listItems[0].fraktal.offers.find(x => x.offerer.id == account.toLocaleLowerCase());
            if(findOffer){
              setIsOfferer(true);
            }
          }
        }
      }else{
        setNftObject()
      }
  },[account])

  const toPay = () => utils.parseEther(((fraktionsToBuy * nftObject.price)+0.000000001).toString());

  async function buyingFraktions() {
      try {
        await buyFraktions(
          nftObject.seller,
          nftObject.tokenAddress,
          fraktionsToBuy,
          toPay(),
          provider,
          marketAddress).then(()=>router.reload());
      }catch(err){
        console.error('Error',err);
      }
  }

  // useEffect(async () => {
  //   if(nftObject && contractAddress){
  //     let minPriceParsed;
  //     try{
  //       let minPrice = await getMinimumOffer(nftObject.tokenAddress, provider, contractAddress)
  //       minPriceParsed = utils.formatEther(minPrice);
  //     }catch {
  //       minPriceParsed = 0.
  //     }
  //     setMinOffer(minPriceParsed);
  //   }
  // },[nftObject, contractAddress])

  async function launchOffer() {
    try {
      makeOffer(
        utils.parseEther(offerValue),
        nftObject.tokenAddress,
        provider,
        marketAddress).then(()=>{
          router.push('/my-nfts');
        })

    }catch(e){
      console.error('There has been an error: ',e)
    }
  }

  async function claimNFT() {
    try {
      let tx = await claimFraktalSold(nftObject.marketId, provider, contractAddress);
      if(tx){
        router.push('/my-nfts');
      }
    }catch(e){
      console.error('There has been an error: ',e)
    }
  }

  const exampleNFT = {
    id: 0,
    name: "Golden Fries Cascade",
    imageURL: "/filler-image-1.png",
    artistAddress: "0x1234...5678",
    createdAt: new Date().toISOString(),
    countdown: new Date("06-25-2021"),
  };

  return (
    <VStack spacing="0" mb="12.8rem">
      <Head>
        <title>Fraktal - NFT</title>
      </Head>
      <div>
        <Link href="/">
          <div className={styles.goBack}>← back to all NFTS</div>
        </Link>

        <div className={styles.header}>{nftObject?nftObject.name:''}</div>
        <VStack spacing="32px" marginTop="40px" align="flex-center">
          <div>
              <Image
              src={nftObject?nftObject.imageURL:exampleNFT.imageURL}
              w="100%"
              h="100%"
              style={{ borderRadius: "4px 4px 0px 0px" }}
              />
            <div className={styles.NFTCard}>
              <div className={styles.cardHeader}>ARTIST</div>
              <div className={styles.cardText} style={{ color: "#985cff" }}>
                {nftObject? shortenHash(nftObject.creator) : 'loading'}
              </div>
              <div className={styles.cardHeader}>CONTRACT ADDRESS</div>
              <Link href="/">
                <div className={styles.cardText} style={{ color: "#985cff" }}>
                {nftObject? shortenHash(nftObject.tokenAddress) : 'loading'}
                </div>
              </Link>
              <div style={{ marginTop: "8px" }} className={styles.cardHeader}>
                DATE OF CREATION
              </div>
              <div className={styles.cardText}>
                {nftObject?timezone(nftObject.createdAt):'loading'}
              </div>
            </div>
          </div>
          <div className={styles.auctionCard}>
            <div style={{ marginRight: "22px", marginBottom: "24px" }}>
              <div className={styles.auctionCardDetailsContainer}>


                <div style={{ marginRight: "48px" }}>
                  <div className={styles.auctionCardDetailsNumber}>{nftObject?nftObject.amount:''}</div>
                  <div className={styles.auctionCardDetailsText}>Fraktions on sale</div>
                </div>
                <div style={{ marginRight: "28px" }}>
                  <div className={styles.auctionCardDetailsNumber}>{nftObject?Math.round(nftObject.price*10000)/10000:''}</div>
                  <div className={styles.auctionCardDetailsText}>Price of Fraktion</div>
                </div>

              </div>
            </div>
            <div className={styles.auctionCardDivider} />
            <div style={{ marginRight: "24px" }}>
              <div className={styles.auctionCardDetailsContainer}>
                {nftObject &&
                  <div style={{ marginRight: "48px" }}>
                  <div className={styles.auctionCardDetailsNumber}>{Math.round(nftObject.price*10**6)/100}ETH</div>
                  <div className={styles.auctionCardDetailsText}>Full NFT value</div>
                  </div>
                }

                <div>
                  <div className={styles.auctionCardDetailsNumber}>{fraktalOwners}</div>
                  <div className={styles.auctionCardDetailsText}>Investors</div>
                </div>
              </div>
            </div>

            {!itemSold ?
            <div>
              <div className={styles.contributeContainer1}>
                <div style={{ marginLeft: "24px" }}>
                  <div className={styles.contributeHeader}>Buy fraktions</div>
                  <input
                    className={styles.contributeInput}
                    type="number"
                    onChange={(e)=>setFraktionsToBuy(e.target.value)}
                  />
                </div>
                <div style={{ marginLeft: "24px" }}>
                  <div className={styles.contributeHeader}>Total</div>
                  <div className={styles.contributeHeader}>
                    {nftObject?parseFloat(fraktionsToBuy*nftObject.price).toFixed(4): 0} ETH
                  </div>
                </div>
                <FrakButton disabled= {!fraktionsToBuy || parseInt(fraktionsToBuy) > nftObject.amount } className={styles.contributeCTA} onClick={()=>buyingFraktions()}>
                BUY
                </FrakButton>
              </div>

              {!isOfferer ?
                <div className={styles.contributeContainer2}>
                  <Button
                    isOutlined
                    style={{
                      backgroundColor: "white",
                      marginRight: "16px",
                      width: "192px",
                    }}
                    onClick={()=>setValueSetter(!valueSetter)}
                  >
                    {valueSetter? 'Cancel' : 'Make an Offer'}
                  </Button>
                  {valueSetter &&
                    <input
                      style={{
                        fontSize:'48px',
                        color: 'black',
                        fontWeight:'bold',
                        textAlign:'center',
                        maxWidth:'110px',
                        marginRight:'10px',
                        marginLeft:'10px',
                        borderRadius: '8px',
                        background:'transparent'
                      }}
                      disabled={!nftObject}
                      type="number"
                      placeholder="ETH"
                      onChange={(e)=>{setOfferValue(e.target.value)}}
                    />
                  }
                  {valueSetter && offerValue > minOffer &&
                    <Button
                      isOutlined
                      style={{
                        backgroundColor: "white",
                        marginRight: "16px",
                        width: "192px",
                      }}
                      onClick={()=>launchOffer()}
                    >
                      {'Offer'}
                    </Button>
                  }
                </div>
              :
                <div className={styles.contributeContainer2}>
                  <Button
                    isOutlined
                    style={{
                      backgroundColor: "white",
                      marginRight: "16px",
                      width: "192px",
                    }}
                    onClick={()=>launchOffer()}
                  >
                    {'Take out offer'}
                  </Button>
                </div>
              }
            </div>
            :
            <div>
            <div className={styles.contributeContainer2}>
              <Button
                isOutlined
                style={{
                  backgroundColor: "white",
                  marginRight: "16px",
                  width: "192px",
                }}
                onClick={()=>claimNFT()}
              >
                {'Claim NFT'}
              </Button>
            </div>
            </div>
          }
          </div>


        </VStack>

      </div>
    </VStack>
  );
}
