import Head from "next/head";
import Link from "next/link";
import { utils } from "ethers";
import FrakButton from '../../../components/button';
import Button from "../../../components/button";
import styles from "./auction.module.css";
import { HStack, VStack } from "@chakra-ui/layout";
import React, {useEffect, useState} from "react";
import FraktionsList from '../../../components/fraktionsList';
import UserOwnership from '../../../components/userOwnership';
import BuyOutCard from '../../../components/buyOutCard';
import { Image } from "@chakra-ui/image";
import {shortenHash, timezone, getParams} from '../../../utils/helpers';
import { getSubgraphData } from '../../../utils/graphQueries';
import { createObject } from '../../../utils/nftHelpers';
import { useWeb3Context } from '../../../contexts/Web3Context';
import { getBalanceFraktions, getMinimumOffer } from '../../../utils/contractCalls';
import { useRouter } from 'next/router';

export default function DetailsView() {
  const router = useRouter();
  const [fraktalOwners, setFraktalOwners] = useState(1);
  const [fraktionsToBuy, setFraktionsToBuy] = useState(0);
  const [valueSetter, setValueSetter] = useState(false);
  const [isOfferer, setIsOfferer] = useState(false);
  const [itemSold, setItemSold] = useState(false);

  const {account, provider, marketAddress} = useWeb3Context();
  const [offers, setOffers] = useState();
  const [minOffer, setMinOffer] = useState(0.);
  const [nftObject, setNftObject] = useState();
  const [tokenAddress, setTokenAddress] = useState();
  const [fraktionsListed, setFraktionsListed] = useState([]);
  const [userFraktions, setUserFraktions] = useState(0);

// use callbacks
  useEffect(async ()=>{
      const tokenAddress = getParams('nft');
      const tokenAddressSplitted = tokenAddress.split('/details')[0]
      setTokenAddress(tokenAddressSplitted);
      let fraktionsFetch = await getSubgraphData('fraktions',tokenAddressSplitted)
      if(fraktionsFetch.listItems){
        setFraktionsListed(fraktionsFetch.listItems)
      }
      let fraktalFetch = await getSubgraphData('fraktal',tokenAddressSplitted)
      if(fraktalFetch && fraktalFetch.fraktalNfts){
        console.log('frak fetch',fraktalFetch)
        let nftObjects = await createObject(fraktalFetch.fraktalNfts[0])
        if(nftObjects){
          setNftObject(nftObjects)
        }
        if(fraktalFetch.fraktalNfts[0].offers){
          setOffers(fraktalFetch.fraktalNfts[0].offers)
        }
      }
  },[account])

  useEffect(async ()=>{
    if(tokenAddress && account && provider){
      let userBalance = await getBalanceFraktions(account, provider, tokenAddress)
      if(userBalance){
        setUserFraktions(userBalance);
      }
    }
  },[account, provider, tokenAddress]);

  useEffect(async () => {
    if(tokenAddress && marketAddress){
      let minPriceParsed;
      try{
        let minPrice = await getMinimumOffer(tokenAddress, provider, marketAddress)
        minPriceParsed = utils.formatEther(minPrice);
      }catch {
        minPriceParsed = 0.
      }
      setMinOffer(minPriceParsed);
    }
  },[nftObject, marketAddress])

  // but add the Claim collateral function here?

  // async function claimNFT() { // this one goes to offersCard
  //   try {
  //     let tx = await claimFraktalSold(nftObject.marketId, provider, contractAddress);
  //     if(tx){
  //       router.push('/my-nfts');
  //     }
  //   }catch(e){
  //     console.log('There has been an error: ',e)
  //   }
  // }

  return (
    <HStack>
      <VStack marginRight='53px'>
        <Link href="/">
          <div className={styles.goBack}>← back to all NFTS</div>
        </Link>
        <Image
          src={nftObject?nftObject.imageURL:null}
          w="100%"
          h="100%"
          style={{ borderRadius: "4px 4px 0px 0px" }}
        />
        <HStack justifyContent='space-between' marginTop='16px'>
          <VStack>
            <div style={{
              fontFamily:'Inter',
              fontWeight:600,
              fontSize:'12px',
              lineHeight:'14px',
              letterSpacing:'1px',
              color:'#A7A7A7'
            }}>
              ARTIST
            </div>
            <div style={{
              fontFamily: 'Inter',
              fontWeight: 500,
              fontSize: '16px',
              lineHeight: '19px'
            }}>
            {nftObject? shortenHash(nftObject.creator) : 'loading'}
            </div>
          </VStack>
          <VStack>
            <div style={{
              fontFamily:'Inter',
              fontWeight:600,
              fontSize:'12px',
              lineHeight:'14px',
              letterSpacing:'1px',
              color:'#A7A7A7'
            }}>
              DATE OF CREATION
            </div>
            <div style={{
              fontFamily: 'Inter',
              fontWeight: 500,
              fontSize: '16px',
              lineHeight: '19px'
            }}>
            {nftObject?timezone(nftObject.createdAt):'loading'}
            </div>
          </VStack>
        </HStack>
        <UserOwnership
          fraktions={userFraktions}
        />
        <div>
          List / unList fraktions
        </div>
        <div>
          defraktionalize? / claim collateral?
        </div>
      </VStack>
      <VStack spacing="0" mb="12.8rem">
        <div style={{
          fontSize:'48px',
          fontFamily:'Inter',
          fontWeight: 800,
          lineHeight: '64px'
        }}>
          {nftObject?nftObject.name:'Loading'}
        </div>
        <div style={{
          fontSize:'16px',
          fontFamily:'Inter',
          fontWeight: 400,
          lineHeight: '22px',
          marginBottom: '40px'
        }}>
          {nftObject && nftObject.description?nftObject.description:null}
        </div>
        <FraktionsList
          fraktionsListed = {fraktionsListed}
          tokenAddress={tokenAddress}
          marketAddress={marketAddress}
          provider={provider}
        />
        <div style={{marginTop:'40px'}}>
          <BuyOutCard
            account={account}
            minPrice={minOffer}
            investors={nftObject && nftObject.balances ? nftObject.balances.length : 0}
            offers={offers}
            tokenAddress={tokenAddress}
            marketAddress={marketAddress}
            provider={provider}
          />
        </div>
        <div style={{marginTop:'40px'}}>
          {/* REVENUES */}
        </div>


      </VStack>
    </HStack>
  );
}
