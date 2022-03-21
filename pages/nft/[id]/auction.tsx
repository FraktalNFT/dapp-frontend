/**
 * React
 */
import React, {useEffect, useState} from "react";
/**
 * Chakra
 */
import { VStack } from "@chakra-ui/layout";
import { Image } from "@chakra-ui/image";
import { useToast } from '@chakra-ui/react'
/**
 * Next
 */
import {withRouter} from 'next/router';
import Head from "next/head";
import Link from "next/link";
/**
 * Utils
 */
import { BigNumber } from "ethers";
import styles from "./auction.module.css";
/**
 * Utils
 */
import {shortenHash} from '@/utils/helpers';
import {getSubgraphAuction } from '@/utils/graphQueries';
import { createListedAuction } from "@/utils/nftHelpers";
import { utils } from "ethers";
/**
 * Countdown
 */
import Countdown, {zeroPad} from 'react-countdown';
/**
 * Contracts
 */
import { participateAuction, getAuctionReserve } from "utils/contractCalls";
/**
 * Contexts
 */
import { useWeb3Context } from "@/contexts/Web3Context";
import Custom404 from "../../404";
import {EXPLORE} from "@/constants/routes";
import { useLoadingScreenHandler } from "hooks/useLoadingScreen";

/**
 * Components
 */
import VerifyNFT from "@/components/verifyNFT";

/**
 * Auction NFT View
 * @param router
 * @constructor
 */

function AuctionNFTView({router}) {

  const { account, provider, marketAddress, factoryAddress } = useWeb3Context();
  const [index, setIndex] = useState();
  const [nftObject, setNftObject] = useState(null);
  const [contribute,setContribute] = useState(0);
  const [error, setError] = useState(false);
  const [currentReserve,setCurrentReserve] = useState(-1);
  const [refresh,setRefresh] = useState(true);
  const [completed,setCompleted] = useState(false);
  const toast = useToast();
  const { closeLoadingModalAfterDelay } = useLoadingScreenHandler()

  const auctionReserve = async (seller, sellerNonce) =>{
    if(provider) {
      const reserve = await getAuctionReserve(seller, sellerNonce, provider, marketAddress);
      return reserve;
    }
    return -1;
  }

  const refreshPage = () =>{
    setRefresh(!refresh);
  }

  const handleContribute = async () => {
    if(contribute==0){
      toast({
        title: 'No ETH contributed',
        status: 'error',
        duration: 2000,
        isClosable: true,
      });
      return;
    }
    const {tokenAddress,seller,sellerNonce} = nftObject;

    const weiVal = utils.parseUnits(contribute.toString());

    try {
      const tx = await participateAuction(tokenAddress,seller,sellerNonce,weiVal,provider,marketAddress)
      .then((e)=> {
        closeLoadingModalAfterDelay()
      });
      toast({
        title: `Contributed ${contribute.toString()} ETH` ,
        status: 'success',
        duration: 2000,
        isClosable: true,
      })
      
      refreshPage();
    } catch (error) {
      toast({
        title: error ,
        status: 'error',
        duration: 2000,
        isClosable: true,
      })
      console.log(error);
    }

  }

  const handleContributeChange = (e)=>{
    const val = e.target.value;
    setContribute(val);
  }

  useEffect(() => {
  }, )

  useEffect(async ()=>{
      if(!router.isReady) return;

      // const address = getParams('nft');
      // const index = address.split('/auction')[0]
      const index = router.query.id;

      if(index){
        setIndex(index)
      }

      let obj = await getSubgraphAuction('singleAuction', index);
      if(obj?.auction == null){
        setError(true);
        return;
      }

      let _hash = await getSubgraphAuction("auctionsNFT", obj.auction.tokenAddress);
      Object.assign(obj.auction,{
        "hash":_hash.fraktalNft.hash,
      });

      const item = await createListedAuction(obj.auction);
      Object.assign(obj.auction,{
        "hash":_hash.fraktalNft.hash,
        "name":item.name,
        "imageURL":item.imageURL,
        "seller": item.seller,
        "collateral": _hash.fraktalNft.collateral
      });

    if(obj) {
        setNftObject(obj.auction);
        const objReserve = await auctionReserve(obj.auction.seller, obj.auction.sellerNonce);
        setCurrentReserve(Number(utils.formatEther(objReserve)));
      }
  },[router.isReady,refresh])

  const exampleNFT = {
    id: 0,
    name: "Golden Fries Cascade",
    imageURL: "filler-image-1.png",
    artistAddress: "0x1234...5678",
    contributions: BigNumber.from(5).div(100),
    createdAt: new Date().toISOString(),
    countdown: new Date("06-25-2021"),
  };

  const renderer = ({ days, hours, minutes, seconds, completed })=>{
    if (completed) {
      setCompleted(true);
      // Render a completed state
      return <div>Ended</div>;
    } else {
      // Render a countdown
      if(days>0){
        return <div style={{ marginRight: "52px"}}>
        <div className={styles.auctionCardHeader}>Time Remaining</div>
          <div className={styles.auctionCardDetailsContainer}>
            <div style={{ marginRight: "48px" }}>
              <div className={styles.auctionCardDetailsNumber}>{zeroPad(days)}</div>
              <div className={styles.auctionCardDetailsText}>Days</div>
            </div>
            <div style={{ marginRight: "28px" }}>
              <div className={styles.auctionCardDetailsNumber}>{zeroPad(hours)}</div>
              <div className={styles.auctionCardDetailsText}>Hours</div>
            </div>
            <div>
              <div className={styles.auctionCardDetailsNumber}>{zeroPad(minutes)}</div>
              <div className={styles.auctionCardDetailsText}>Minutes</div>
            </div>
          </div>
        </div>;
      }
      else{
        return (
        <div style={{ marginRight: "52px" }}>
        <div className={styles.auctionCardHeader}>Time Remaining</div>
          <div className={styles.auctionCardDetailsContainer}>
            <div style={{ marginRight: "48px" }}>
              <div className={styles.auctionCardDetailsNumber}>{zeroPad(hours)}</div>
              <div className={styles.auctionCardDetailsText}>Hours</div>
            </div>
            <div style={{ marginRight: "28px" }}>
              <div className={styles.auctionCardDetailsNumber}>{zeroPad(minutes)}</div>
              <div className={styles.auctionCardDetailsText}>Minutes</div>
            </div>
            <div>
              <div className={styles.auctionCardDetailsNumber}>{zeroPad(seconds)}</div>
              <div className={styles.auctionCardDetailsText}>Seconds</div>
            </div>
          </div>
        </div>
        );
      }
    }
  }

  if(error==true){
    return <Custom404/>
  }else{

  return (
    <VStack spacing="0" mb="12.8rem">
      <Head>
        <title>Fraktal - NFT</title>
      </Head>
      <div>
        <Link href={EXPLORE}>
          <div className={styles.goBack}>← back to all NFTS</div>
        </Link>

        <div className={styles.header}>{nftObject?nftObject.name:''}</div>
        <VStack spacing="32px" marginTop="40px" align="flex-center">
          <div>
              <Image
              src={'https://image.fraktal.io/?height=650&image=' + encodeURIComponent(nftObject?nftObject.imageURL:exampleNFT.imageURL)}

              w="100%"
              style={{ borderRadius: "4px 4px 0px 0px" }}
              />
            <div className={styles.NFTCard}>
              <div className={styles.cardHeader}>Auctioneer</div>
              <div className={styles.cardText} style={{ color: "#985cff" }}>
                {nftObject? shortenHash(nftObject.seller) : 'loading'}
              </div>
              <div style={{ marginTop: "8px" }} className={styles.cardHeader}>
                TOKEN ADDRESS
              </div>
              <div className={styles.cardText}>
                {nftObject?nftObject.tokenAddress:'loading'}
              </div>
              <div style={{ marginTop: "8px" }} className={styles.cardHeader}>
                RESERVE PRICE
              </div>
              <div className={styles.cardText}>
                {nftObject?`${utils.formatUnits(nftObject.reservePrice)} ETH`:'loading'}
              </div>
              <div style={{ marginTop: "8px" }} className={styles.cardHeader}>
                Fraktion Amount
              </div>
              <div className={styles.cardText}>
                {nftObject?`${utils.formatUnits(nftObject.amountOfShare)}/10,000 Fraktions (${Number(utils.formatUnits(nftObject.amountOfShare))/100}% of max. supply)`:'loading'}
              </div>
              {nftObject && <VerifyNFT nftObject={nftObject}/>}

            </div>
          </div>
          {nftObject&&<div className={styles.auctionCard}>
            <div style={{ marginRight: "52px" }}>
            <Countdown renderer={renderer} date={Number(nftObject.endTime)*1000} autoStart
                />
            </div>
            {currentReserve!=-1&&(
              <div className={styles.auctionCardDivider} />
            )}
            {currentReserve!=-1&&(
              <div>
                <div className={styles.auctionCardHeader}>ETH Contributed</div>
                <div className={styles.auctionCardDetailsContainer}>
                  <div style={{ marginRight: "60px" }}>
                    <div className={styles.auctionCardDetailsNumber}>{currentReserve}</div>
                    <div className={styles.auctionCardDetailsText}>ETH</div>
                  </div>
                </div>
              </div>
            )}



            {!completed && (<div className={styles.contributeContainer}>
              <div style={{ marginLeft: "24px" }}>
                <div className={styles.contributeHeader}>ETH</div>
                <input
                  className={styles.contributeInput}
                  type="number"
                  placeholder={"0.01"}
                  onChange={handleContributeChange}
                />
              </div>
              <button className={styles.contributeCTA} onClick={handleContribute}
              >Contribute</button>
            </div>)}
          </div>}
        </VStack>

      </div>
    </VStack>
  );
  }
}

export default withRouter(AuctionNFTView);

