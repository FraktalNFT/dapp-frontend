import { Grid, VStack } from "@chakra-ui/layout";
import Head from "next/head";
import React, {useEffect, useState} from "react";
import NFTItemManager from "../components/nft-item-manager";
import NFTItemOS from '../components/nft-item-opensea';
import NFTItem from '../components/nft-item';
import NextLink from "next/link";
import styles from "../styles/my-nfts.module.css";
import FrakButton from "../components/button";
import { useWeb3Context } from '../contexts/Web3Context';
import { utils } from 'ethers';
import { getSubgraphData } from '../utils/graphQueries';
import { createObject, createObject2, createOpenSeaObject } from '../utils/nftHelpers';
import {
  rescueEth,
  claimFraktalSold,
  importFraktal,
  claimERC1155,
  claimERC721,
  approveMarket,
  importERC721,
  importERC1155,
  getApproved,
  getLockedTo,
  makeOffer
} from '../utils/contractCalls';
import { assetsInWallet } from '../utils/openSeaAPI';
import { useRouter } from 'next/router';

export default function MyNFTsView() {
  const router = useRouter();
  const { account, provider, factoryAddress, marketAddress } = useWeb3Context();
  const [nftItems, setNftItems] = useState();
  const [fraktionItems, setFraktionItems] = useState();
  const [totalBalance, setTotalBalance] = useState(0);
  const [offers, setOffers] = useState();
  const [userFraktals, setUserFraktals] = useState();

  async function getAccountFraktions(){
    let objects = await getSubgraphData('wallet',account.toLocaleLowerCase())
    // console.log('fraktions wallet ',objects)
    return objects;
  };
  async function getUserOffers(){
    let objects = await getSubgraphData('offers',account.toLocaleLowerCase())
    return objects;
  };

  async function takeOutOffer(address) {
    try {
      makeOffer(
        utils.parseEther('0'),
        address,
        provider,
        marketAddress).then(()=>{
          router.push('/my-nfts');
        })
    }catch(e){
      console.log('There has been an error: ',e)
    }
  }

  async function claimNFT(item){
    let approved = await getApproved(account, factoryAddress, provider, item.id);
    let done:Boolean;
    if(!approved){
      done = await approveContract(factoryAddress, item.id);
    } else {
      done = true;
    }
    let tx;
    if(done){
      if(item.collateralType == 'ERC721'){
        tx = await claimERC721(item.marketId, provider, factoryAddress)
      }else{
        tx = await claimERC1155(item.marketId, provider, factoryAddress)
      }
    }
    if(tx){
      router.push('/my-nfts');
    }
  }

  async function claimFraktal(id) {
    try {
      await claimFraktalSold(id, provider, contractAddress).then(()=>{
        router.push('/my-nfts');
      });
    } catch(err){
      console.log('Error: ',err);
    }
  }

  async function approveContract(contract, tokenAddress){
    let done = await approveMarket(contract, provider, tokenAddress)
    return done;
  }

  async function importNFT(item){
    let res;
    let done;
    let approved = await getApproved(account, factoryAddress, provider, item.id);
    // console.log('is approved?',approved)
    if(!approved){
      done = await approveContract(factoryAddress, item.id);
    } else {
      done = true;
    }
    // overflow problem with opensea assets.. subid toooo big
    if(done){
      if(item.token_schema == 'ERC721'){
        res = await importERC721(parseInt(item.tokenId), item.id, provider, factoryAddress)
      } else {
        res = await importERC1155(parseInt(item.tokenId), item.id, provider, factoryAddress)
      }
    }
    if(done && res){
      router.reload();
    }
  }
  async function importFraktalToMarket(item){
    let res;
    let done;
    let approved = await getApproved(account, marketAddress, provider, item.id);
    // console.log('is approved?',approved)
    if(!approved){
      done = await approveContract(marketAddress, item.id);
    } else {
      done = true;
    }
    // overflow problem with opensea assets.. subid toooo big
    if(done){
      res = await importFraktal(item.id,1,provider,marketAddress); // change 1 to fraktionsIndex.. should be changeable
    }
    if(done && res){
      router.reload();
    }
  }
  useEffect(async()=>{
    if(account) {
      let openseaAssets = await assetsInWallet(account);
      // let fraktalObjects = ;
      let fobjects = await getAccountFraktions();
      let nftsERC721_wallet;
      let nftsERC1155_wallet;
      let totalNFTs = [];
      let fraktionsObjects;
      if(fobjects && fobjects.users.length){
        let userBalance = fobjects.users[0].balance
        setTotalBalance(parseFloat(userBalance)/10**18)
        // console.log('fraktions',fobjects.users[0])
        let validFraktions = fobjects.users[0].fraktions.filter(x=>{return x.status != 'retrieved'})
        fraktionsObjects = await Promise.all(validFraktions.map(x=>{return createObject(x)}))
        if(fraktionsObjects){
          let fraktionsObjectsClean = fraktionsObjects.filter(x=>{return x != null});
          setFraktionItems(fraktionsObjectsClean)
        }else{
          setFraktionItems([])
        }
      }

      if(openseaAssets && openseaAssets.assets && openseaAssets.assets.length){
          nftsERC721_wallet = openseaAssets.assets.filter(x=>{return x.asset_contract.schema_name == 'ERC721'})
          if(nftsERC721_wallet && nftsERC721_wallet.length){
            totalNFTs = totalNFTs.concat(nftsERC721_wallet);
          }
          nftsERC1155_wallet = openseaAssets.assets.filter(x=>{return x.asset_contract.schema_name == 'ERC1155'})// && x.token_id != '0'

          totalNFTs = nftsERC721_wallet.concat(nftsERC1155_wallet);
          let userFraktalsFetched = fobjects.users[0].fraktals;
          let userFraktalObjects = await Promise.all(userFraktalsFetched.map(x=>{return createObject2(x)}))
          let fraktalsClean;
          if(userFraktalObjects){
            fraktalsClean = userFraktalObjects.filter(x=>{return x != null && x.imageURL.length});
            setUserFraktals(fraktalsClean)
          }
          let userFraktalAddresses = fraktalsClean.map(x => {return x.id});
          let userFraktionsAddreses = fraktionsObjects.map(x => {return x.id});
          let totalAddresses = userFraktalAddresses.concat(userFraktionsAddreses);
          let nftsFiltered = totalNFTs.map(x=>{
            if(!totalAddresses.includes(x.asset_contract.address)){
            return x
          }
          })
          // console.log('listas:', nftsFiltered)
          let nftObjects = await Promise.all(nftsFiltered.map(x=>{return createOpenSeaObject(x)}))
          if(nftObjects){
            let nftObjectsClean = nftObjects.filter(x=>{return x != null && x.imageURL.length});
            setNftItems(nftObjectsClean)
          }else{
            setNftItems([])
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
        Your Fraktal NFTs
      </div>
      {userFraktals?.length ? (
        <Grid
          mt='40px !important'
          ml='0'
          mr='0'
          mb='5.6rem !important'
          w='100%'
          templateColumns='repeat(3, 1fr)'
          gap='3.2rem'
        >
          {userFraktals.map(item => (
            <div key={item.id+'-'+item.tokenId}>
              <NextLink key={item.id} href={`/nft/${item.id}/details`}>
                <NFTItem
                  item={item}
                  name={item.name}
                  amount={null}
                  price={null}
                  imageURL={item.imageURL}
                />
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
      {/*///////////////////////////////////*/}
      <div className={styles.header2}>Your Fraktions</div>
      {fraktionItems?.length ? (
        <div style={{ marginTop: "16px" }}>
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
              <NextLink key={item.id} href={`/nft/${item.id}/details`}>
                <NFTItem
                  item={item}
                  name={item.name}
                  amount={parseInt(item.userBalance)}
                  price={null}
                  imageURL={item.imageURL}
                />
              </NextLink>
            ))}
          </Grid>

          {/*
*/}
        </div>
      ) : (
        <div style={{ marginTop: "8px" }}>
          <div className={styles.descText}>
            Head over to the marketplace and invest to get some Fraktions!
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
          <div className={styles.claimCTA} onClick={()=>rescueEth(provider, marketAddress).then(()=>router.reload())}>Claim</div>
        </div>
      </div>
      {/*///////////////*/}
      <div className={styles.header}>
        Your Wallet NFTs
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
            <div key={item.id+'-'+item.tokenId}>
            {item.token_schema == 'ERC1155' && item.tokenId == 0 ?
              <NFTItemOS
                item={item}
                CTAText={"Import to market"}
                onClick={()=>importFraktalToMarket(item)}
              />
               :
              <NFTItemOS
                item={item}
                CTAText={"Import"}
                onClick={()=>importNFT(item)}
              />
            }
            </div>
          ))}
        </Grid>
      ) : (
        <div style={{ marginTop: "8px" }}>
          <div className={styles.descText}>
            You dont have NFTs in your wallet.
          </div>
        </div>
      )}
      {/*offers && offers.length &&
        <div>
          <div className={styles.header2}>OFFERS</div>
          <Grid
          mt='40px !important'
          ml='0'
          mr='0'
          mb='5.6rem !important'
          w='100%'
          templateColumns='repeat(3, 1fr)'
          gap='3.2rem'
          >
          {offers && offers.map(item => (
            <div key={item.id}>
            {item.status == "buyer" ?
              <div>
                <NFTItem
                  item={item}
                  onClick={()=>claimFraktal(item.marketId)}
                  CTAText="Claim Fraktal"
                />
              </div>
              :
              <div>
                <NFTItem
                  item={item}
                  onClick={()=>takeOutOffer(item.id)}
                  CTAText="Take out offer"
                />
              </div>
            }
            </div>
          ))}
          </Grid>
        </div>
      */}
    </VStack>
  )
};
