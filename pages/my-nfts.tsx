import { gql, useQuery } from "@apollo/client";
import { Grid, HStack, VStack } from "@chakra-ui/layout";
import Head from "next/head";
import React, {useEffect, useState, useCallback} from "react";
import { BigNumber } from "ethers";
import { FrakCard, NFTItemType } from "../types";
import NFTItemManager from "../components/nft-item-manager";
import NextLink from "next/link";
import styles from "../styles/my-nfts.module.css";
import FrakButton from "../components/button";
import { useWeb3Context } from '../contexts/Web3Context';
import { getSubgraphData, createObject } from '../utils/graphQueries';
import { rescueEth } from '../utils/contractCalls';
export default function MyNFTsView() {
  const { account, provider, contractAddress } = useWeb3Context();
  const [nftItems, setNftItems] = useState();
  const [totalBalance, setTotalBalance] = useState(0);
  const [fraktionItems, setFraktionItems] = useState();

  async function getAccountFraktions(){
    let objects = await getSubgraphData('account_fraktions',account.toLocaleLowerCase())
    return objects;
  };
  useEffect(async()=>{
    if(account) {
      let fobjects = await getAccountFraktions()
      if(fobjects && fobjects.fraktionsBalances.length){
        let userBalance = fobjects.fraktionsBalances[0].owner.balance // only one!
        setTotalBalance(parseFloat(userBalance)/10**18)
        console.log('nft Objects', fobjects.fraktionsBalances)
        let nftObjects = await Promise.all(fobjects.fraktionsBalances.map(x=>{return createObject(x.nft)}))
        if(nftObjects){
          setFraktionItems(nftObjects)
          const ownedNfts = nftObjects.filter(x=>x.owner === account.toLocaleLowerCase())
          if (ownedNfts.length){
            setNftItems(ownedNfts)
          }else{
            setNftItems([])
          }
        }else{
          setNftItems([])
          setFraktionItems([])
        }
      }
    }
  },[account]);

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
            <div key={item.marketId}>
            <NextLink href={`/nft/${item.marketId}/list-item`}>
              <NFTItemManager item={item} CTAText={"List on Market"} />
            </NextLink>
            </div>
          ))}
        </Grid>
      ) : (
        <div style={{ marginTop: "8px" }}>
          <div className={styles.descText}>
            Transfer NFT to your wallet or Mint a new NFT.
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <NextLink href={`/mint-nft`}>
              <FrakButton style={{ width: "240px", marginTop: "24px" }}>
              Mint NFT
              </FrakButton>
            </NextLink>
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
                <div className={styles.claimAmount}>{Math.round(totalBalance*1000)/1000}</div>
              </div>
              <div className={styles.claimCTA} onClick={()=>rescueEth(provider, contractAddress)}>Claim</div>
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
              <div key={item.marketId}>
                <NFTItemManager item={item} />
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
