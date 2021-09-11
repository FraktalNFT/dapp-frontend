// TODO:
// Take a good look to importERC1155 vs Fraktionalize..
//  test, test and more test

import { gql, useQuery } from "@apollo/client";
import { Grid, HStack, VStack } from "@chakra-ui/layout";
import Head from "next/head";
import React, {useEffect, useState, useCallback} from "react";
import { BigNumber } from "ethers";
import { FrakCard, NFTItemType } from "../types";
import NFTItemManager from "../components/nft-item-manager";
import NFTItemOS from '../components/nft-item-opensea';
import NextLink from "next/link";
import styles from "../styles/my-nfts.module.css";
import FrakButton from "../components/button";
import { useWeb3Context } from '../contexts/Web3Context';
import { getSubgraphData, createObject, createOpenSeaObject, fraktionalize } from '../utils/graphQueries';
import { rescueEth } from '../utils/contractCalls';
import { assetsInWallet } from '../utils/openSeaAPI';

export default function MyNFTsView() {
  const { account, provider, contractAddress } = useWeb3Context();
  const [nftItems, setNftItems] = useState();
  const [fraktionItems, setFraktionItems] = useState();
  const [totalBalance, setTotalBalance] = useState(0);

  async function getAccountFraktions(){
    let objects = await getSubgraphData('wallet',account.toLocaleLowerCase())
    return objects;
  };
  async function prefraktionalize(id){
      try {
        let tx = await fraktionalize(id, provider, contractAddress);
        if (tx) {setPrepare(false)}
      }catch(e){
        console.log('There has been an error: ',e)
      }
  }

  // pasar ambas busquedas a useCallbacks.. manejar aqui el filtro
  useEffect(async()=>{
    if(account) {
      let openseaAssets = await assetsInWallet(account);
      let fobjects = await getAccountFraktions()
      if(openseaAssets && openseaAssets.assets.length && fobjects){
        console.log(openseaAssets)
        let nftObjects = await Promise.all(openseaAssets.assets.map(x=>{return createOpenSeaObject(x)}))
        let nftsERC721_wallet;
        let nftsERC1155_wallet;
        let totalNFTs = [];
        if(nftObjects){
          // console.log('nftObjects',nftObjects)
          let nftObjectsClean = nftObjects.filter(x=>{return x != null});
          nftsERC721_wallet = nftObjectsClean.filter(x=>{return x.token_schema == 'ERC721'})
          if(nftsERC721_wallet && nftsERC721_wallet.length){
            totalNFTs = totalNFTs.concat(nftsERC721_wallet);
          }
          nftsERC1155_wallet = nftObjectsClean.filter(x=>{return x.token_schema == 'ERC1155' && x.tokenId != '1' && x.imageURL})
          if(nftsERC1155_wallet && nftsERC1155_wallet.length && fobjects && fobjects.users.length){
            //list of fraktions addresses to clean up opensea assets
            let fobjectsAddresses = fobjects.users[0].fraktals.map(x=> {return x.id});
            // console.log('subgraph: ',fobjectsAddresses)
            // console.log('to check: ',nftsERC1155_wallet);
            // filter openSea assets
            let fraktals = nftsERC1155_wallet.filter(x=> fobjectsAddresses.includes(x.id))
            // console.log('possibly fraktals ',fraktals)
            // let fraktalsObjects = await Promise.all(fobjects.users[0].fraktalss.map(x=>{return createObject(x.nft)}))

            totalNFTs = nftsERC721_wallet.concat(nftsERC1155_wallet);

          }
          setNftItems(totalNFTs)
          let fraktionsERC1155_wallet = nftObjectsClean.filter(x=>{return x.token_schema == 'ERC1155' && x.tokenId == '1' && x.imageURL})
        }else{
          setNftItems([])
        }

        console.log('fobjects',fobjects)
        if(fobjects && fobjects.users.length){


          // this is total balance of the seller
          let userBalance = fobjects.users[0].balance
          setTotalBalance(parseFloat(userBalance)/10**18)

          // console.log('nft Objects', fobjects.fraktionsBalances)
          let nftObjects = await Promise.all(fobjects.users[0].fraktions.map(x=>{return createObject(x.nft)}))
          if(nftObjects){
            console.log('promises are ',nftObjects)
            let nftObjectsClean = nftObjects.filter(x=>{return x != null});
            setFraktionItems(nftObjectsClean)
          }else{
            setFraktionItems([])
          }
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
            <div key={item.id}>
              <NFTItemOS item={item} CTAText={"Import"} />
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
              <div key={item.id}>
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
