import { gql, useQuery } from "@apollo/client";
import { Grid, HStack, VStack } from "@chakra-ui/layout";
import Head from "next/head";
import React, {useEffect, useState, useCallback} from "react";
import { BigNumber } from "ethers";
import { FrakCard, NFTItemType } from "../types";
import NFTItem from "../components/nft-item";
import NextLink from "next/link";
import styles from "../styles/my-nfts.module.css";
import FrakButton from "../components/button";
import { useWeb3Context } from '../contexts/Web3Context';
import { getAccountFraktalNFTs, createObject } from '../utils/graphQueries';
import ListItemOptions from '../components/listItem';

export default function MyNFTsView() {
  const { account, provider, contractAddress } = useWeb3Context();
  const [nftItems, setNftItems] = useState();
  const [accountAddress, setAccountAddress] = useState(); // to test the effects not fetching..
  const [userBalance, setUserBalance] = useState(0);
  const [fraktionItems, setFraktionItems] = useState();
  const [listModal, setListModal] = useState(false);
  const [signer, setSigner] = useState();


  async function getAccountFraktions(account){
    console.log('searching for ',account,' fraktals')
    let objects = await getAccountFraktalNFTs('account_fraktions',account)///
    console.log('retrieved', objects)
    return objects;
  };

  async function getFraktionsFraktals(list) {
    console.log('searching for ',list,' fraktions')
    let res = await Promise.all(list.map(x=>{return getAccountFraktalNFTs('id_fraktal', x.nft.id)}))
    let fraks = [];
    if(res.length){
      fraks = await Promise.all(res.map(x=>{return createObject(x.fraktalNFTs[0])}))
    }
    console.log('res', fraks)
    return fraks;
  }

  // let fraktionObjects = async () => {return await getAccountFraktions(account)};
  // console.log('fraktionObjects', fraktionObjects())
  useEffect(async()=>{
    let objects;
    let fraktals;
    if (account) {
      // let userObject = await getAccountFraktalNFTs('userAddress', account)
      // console.log('userObject',userObject)
      // objects.fraktionsBalances.map(x=>console.log(x.nft.id.toString()))
      objects = await getAccountFraktions(account);
      if(objects && objects.fraktionsBalances.length > 0) {
        fraktals = await getFraktionsFraktals(objects.fraktionsBalances)
        // console.log('setting objects ',fraktals)
        setFraktionItems(fraktals);
      }
    } else {
      // objects = await getAccountFraktalNFTs('account_fraktions',account)
      setFraktionItems([]);
    }
  },[account])
  useEffect(()=>{
    async function loadSigner() { //Load contract instance
      if (typeof provider !== "undefined") {
        try {
          let signer;
          const accounts = await provider.listAccounts();
          if (accounts && accounts.length > 0) {
            signer = provider.getSigner();// get signer
          } else {
            signer = provider; // or use RPC (cannot sign tx's. should call a connect warning)
          }
          setSigner(signer);
        } catch (e) {
          console.log("ERROR LOADING SIGNER", e);
        }
      }
    }
    loadSigner();
  },[provider, account]);

  // useEffect(async()=>{
  //   setUserBalance(125.99)
  // },[account])

  useEffect(async()=>{
    if(account) {
      let fobjects = await getAccountFraktalNFTs('account_fraktals',account)
      if(fobjects && fobjects.fraktalNFTs.length){
        Promise.all(fobjects.fraktalNFTs.map(x=>{return createObject(x)})).then((results)=>setNftItems(results))
      }
    }
  },[account]);


  async function listItem() {
    console.log('list it!')
  }

  return (
    <VStack spacing='0' mb='12.8rem'>
      <Head>
        <title>Fraktal - My NFTs</title>
      </Head>
      <div className={styles.header}>
        My NFTs
      </div>
      {nftItems?.length ? (
        <Grid
          mt='40px !important'
          ml='0'
          mr='0'
          mb='5.6rem !important'
          w='100%'
          templateColumns='repeat(3, 1fr)'
          gap='3.2rem'
        >
          {nftItems.map(item => (
            <div key={item.id}>
            <NextLink href={`/nft/${item.id}/list-item`}>
              <NFTItem item={item} CTAText={"List on Market"} />
            </NextLink>
            <ListItemOptions
              item={item}
              signer={signer}
              contract={contractAddress}
            />
            </div>
          ))}
        </Grid>
      ) : (
        <div style={{ marginTop: "8px" }}>
          <div className={styles.descText}>
            Transfer NFT to your wallet or Mint a new NFT.
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <FrakButton style={{ width: "240px", marginTop: "24px" }}>
              Mint NFT
            </FrakButton>
          </div>
        </div>
      )}
      <div className={styles.header2}>My Fraktions</div>
      {fraktionItems?.length ? (
        <div style={{ marginTop: "16px" }}>
          <div className={styles.subText}>You have earned</div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "8px",
            }}
          >
            <div className={styles.claimContainer}>
              <div style={{ marginLeft: "24px" }}>
                <div className={styles.claimHeader}>ETH</div>
                {/* add user balance fetched from the contract*/}
                <div className={styles.claimAmount}>{userBalance}</div>
              </div>
              <div className={styles.claimCTA}>Claim</div>
            </div>
          </div>
          <Grid
            mt='40px !important'
            ml='0'
            mr='0'
            mb='5.6rem !important'
            w='100%'
            templateColumns='repeat(3, 1fr)'
            gap='3.2rem'
          >
            {fraktionItems && fraktionItems.map(item => (
              <div>
              <NextLink href={`/nft/${item.id}/manage`} key={item.id}>
                <NFTItem item={item} CTAText={"Manage"} />
              </NextLink>
              <ListItemOptions
                item={item}
                signer={signer}
                contract={contractAddress}
              />
              </div>
            ))}
          </Grid>
        </div>
      ) : (
        <div style={{ marginTop: "8px" }}>
          <div className={styles.descText}>
            Head over to the marketplace and invest to get some Fraktions!
            <br /> If you have already invested, contributions do not appear
            until the auctions are over.
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <NextLink href={"/"}>
              <FrakButton
                isOutlined
                style={{ width: "240px", marginTop: "24px" }}
              >
                Back to Marketplace
              </FrakButton>
            </NextLink>
          </div>
        </div>
      )}
    </VStack>
  );
}
