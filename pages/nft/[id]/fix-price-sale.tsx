import { HStack, VStack } from "@chakra-ui/layout";
import React, {useEffect, useState} from "react";
import Head from "next/head";
import Link from "next/link";
import { BigNumber, utils } from "ethers";
import FrakButton from '../../../components/button';
import Button from "../../../components/button";
import { Image } from "@chakra-ui/image";
import styles from "./auction.module.css";
import {shortenHash, timezone, getParams} from '../../../utils/helpers';
import {getSubgraphData, createListed} from '../../../utils/graphQueries';
import { useWeb3Context } from '../../../contexts/Web3Context';
import { buyFraktions, makeOffer } from '../../../utils/contractCalls';

export default function FixPriceNFTView() {
  const {account, provider, contractAddress} = useWeb3Context();
  const [index, setIndex] = useState();
  const [raised, setRaised] = useState(0);
  const [fraktalOwners, setFraktalOwners] = useState(1);
  const [nftObject, setNftObject] = useState();
  const [fraktionsToBuy, setFraktionsToBuy] = useState(0);
  const [valueSetter, setValueSetter] = useState(false);
  const [offerValue, setOfferValue] = useState(false);
  useEffect(async ()=>{
      const address = getParams('nft');
      const index = address.split('/fix-price-sale')[0]
      if(index){
        setIndex(index)
      }
      let obj = await getSubgraphData('listed_itemsId',index)
      // console.log('obj',obj)
      if(obj){
        if(obj && obj.listItems){
          setFraktalOwners(obj.listItems[0].fraktal.fraktions.length)
        }
        let nftObjects = await createListed(obj.listItems[0])
        if(nftObjects && contractAddress){
          setNftObject(nftObjects)
          if(nftObjects?.raised){
            setRaised(parseFloat(nftObjects.raised)/10**18)
          }
        }
      }else{
        setNftObject()
      }
  },[account])

  const toPay = () => utils.parseEther(((fraktionsToBuy * nftObject.price)+0.000000001).toString()) //utils.parseEther(

  async function buyingFraktions() {
      try {
        let tx = await buyFraktions(
          nftObject.seller,
          nftObject.marketId,
          fraktionsToBuy,
          toPay(),
          provider,
          contractAddress);
      }catch(e){
        console.log('There has been an error: ',e)
      }
  }

  async function launchOffer() {
    try {
      let tx = await makeOffer(
        utils.parseEther(offerValue),
        nftObject.tokenAddress,
        provider,
        contractAddress);
    }catch(e){
      console.log('There has been an error: ',e)
    }
  }

  const exampleNFT = {
    id: 0,
    name: "Golden Fries Cascade",
    imageURL: "/filler-image-1.png",
    artistAddress: "0x1234...5678",
    contributions: BigNumber.from(5).div(100),
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
        <HStack spacing="32px" marginTop="40px" align="flex-start">
          <div>
              <Image
              src={nftObject?nftObject.imageURL:exampleNFT.imageURL}
              w="300px"
              h="300px"
              style={{ borderRadius: "4px 4px 0px 0px" }}
              />
            <div className={styles.NFTCard}>
              <div className={styles.cardHeader}>ARTIST</div>
              <div className={styles.cardText} style={{ color: "#985cff" }}>
                {nftObject? shortenHash(nftObject.creator) : 'loading'}
              </div>
              <div style={{ marginTop: "8px" }} className={styles.cardHeader}>
                DATE OF CREATION
              </div>
              <div className={styles.cardText}>
                {nftObject?timezone(nftObject.createdAt):'loading'}
              </div>
            </div>
          </div>
          <div className={styles.auctionCard}>
            <div style={{ marginRight: "22px" }}>
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
            <div className={styles.contributeContainer}>
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
              <FrakButton className={styles.contributeCTA} onClick={()=>buyingFraktions()}>
              BUY
              </FrakButton>
            </div>
            <div className={styles.CTAsContainer}>
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
                  className={styles.contributeInput}
                  disabled={!nftObject}
                  type="number"
                  placeholder="Offer in ETH"
                  onChange={(e)=>{setOfferValue(e.target.value)}}
                />
              }
              {valueSetter && offerValue != 0 &&
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
          </div>
        </HStack>

      </div>
    </VStack>
  );
}
