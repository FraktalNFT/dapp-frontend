/**
 * React
 */
import React, {useEffect, useState} from "react";
/**
 * Chakra
 */
import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react'
import { Image } from "@chakra-ui/image";
import { VStack } from "@chakra-ui/layout";
/**
 * Next
 */
import { useRouter } from 'next/router';
import Head from "next/head";
import Link from "next/link";
import styles from "./auction.module.css";
/**
 * Components
 */
import FrakButton from '@/components/button';
/**
 * Utils
 */
import {shortenHash, timezone} from '@/utils/helpers';
import {FRAKTALS_BY_MARKET_ID, getSubgraphData, LISTED_ITEM_BY_ID} from '@/utils/graphQueries';
import { createListed, createObject} from '@/utils/nftHelpers';
import { BigNumber, utils } from "ethers";
import { useWeb3Context } from '@/contexts/Web3Context';
/**
 * Contract Calls
 */
import {
  listItem,
  unlistItem,
  fraktionalize,
  defraktionalize,
  approveMarket,
  getApproved,
  getBalanceFraktions,
  listItemAuction,
  getFraktionsIndex,
} from '@/utils/contractCalls';
/**
 * Redux
 */
import store from '@/redux/store';
import {LISTING_NFT, rejectContract} from "@/redux/actions/contractActions";
import LoadScreen from '../../../components/load-screens';

import {EXPLORE, MY_NFTS} from "@/constants/routes";

const exampleNFT = {
  id: 0,
  name: "Golden Fries Cascade",
  imageURL: "/filler-image-1.png",
  artistAddress: "0x1234...5678",
  contributions: BigNumber.from(5).div(100),
  createdAt: new Date().toISOString(),
  countdown: new Date("06-25-2021"),
};

export default function ListNFTView() {
  const router = useRouter();
  const {account, provider, marketAddress} = useWeb3Context();
  const [nftObject, setNftObject] = useState();
  const [index, setIndex] = useState<string>("");
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0.);
  const [fraktions, setFraktions] = useState(0);
  const [locked, setLocked] = useState(false);
  const [transferred, setTransferred] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [prepare, setPrepare] = useState(true);
  const [isAuction, setIsAuction] = useState(false);
  const [isListing, setIsListing] = useState<boolean>(false);

  const fraktalReady = fraktions > 0
    && totalAmount > 0
    && totalAmount <= parseFloat(fraktions)
    && totalPrice > 0
    && isApproved
    && isListing === false;
    //&& nftObject.owner === contractAddress.toLocaleLowerCase();

  async function getIsApprovedForAll(tokenAddress) {
    let approved = await getApproved(account, marketAddress, provider, tokenAddress);
    return approved;
  }

  useEffect(() => {
    async function getData() {
    if(account && nftObject && marketAddress) {
      let approvedTokens;
      try {
        approvedTokens = await getIsApprovedForAll(nftObject.id);
        setIsApproved(approvedTokens);
      }catch(e){
        console.error('Error: ',e);
      }

    }
  }
  getData();
  },[account, nftObject, marketAddress, updating])


  useEffect(()=>{
    async function getData() {
      const pathname = router.asPath;
      const args = pathname.split('/');
      const tokenAddress = args[2];
      if(account && args[2] !== "[id]" && typeof args[2] !== "undefined") {
        setIndex(args[2]);
        // previously was account-index
        // let hexIndex = indexNumber.toString(16);
        let listingString = `${account.toLocaleLowerCase()}-${tokenAddress}`;
        let listing = await getSubgraphData(LISTED_ITEM_BY_ID, listingString);
        // console.log('results ',listing)
        if(listing && listing.listItems.length > 0) {
          setUpdating(true)
          setLocked(true)
          setTransferred(true)
          setUnlocked(true)
          // let ownedFraktions = listing.listItems[0].fraktal.fraktions.find(x=> x.owner.id === account.toLocaleLowerCase())
          // setFraktions(ownedFraktions.amount)
          let nftObject = await createListed(listing.listItems[0])
          if(nftObject && account){
            setNftObject(nftObject)
            let parsedPrice = nftObject.price
            let settedPrice = parseFloat(parsedPrice)*parseFloat(nftObject.amount)
            setTotalPrice(Math.round(settedPrice*100)/100)
            setTotalAmount(nftObject.amount)
            }else {
              setFraktions(0)
            }
          // nftObject gets 2 different inputs (id is different for listed items)
          } else {
            let obj = await getSubgraphData(FRAKTALS_BY_MARKET_ID, args[2])
            if(obj && obj.fraktalNfts) {
              let nftObjects = await createObject(obj.fraktalNfts[0])
              if(nftObjects && account ){
                setNftObject(nftObjects);
                const fraktionIndex = await getFraktionsIndex(provider, nftObjects.id);
                let userBalance = await getBalanceFraktions(account, provider, nftObjects.id, fraktionIndex)
                setFraktions(userBalance);
              }
            }
          }
        }
      }
    getData();
  },[index, account])

  async function callUnlistItem(){
    let tx = await unlistItem(
      nftObject.tokenAddress,
      provider,
      marketAddress)
    if(tx) {
      router.push(MY_NFTS, null, {scroll: false});
    }
  }
  async function listNewItem(){
    setIsListing(true);
    // console.log(`Total price: ${totalPrice}, totalAmout: ${totalAmount}`);
    const fei = utils.parseEther(totalAmount);
    const wei = utils.parseEther(totalPrice);
    if(isAuction){
      listItemAuction(
        nftObject.id,
        wei,//price
        fei,//shares
        provider,
        marketAddress,
        nftObject.name
      ).then(()=>{
          setInterval(() => {
              router.push(EXPLORE, null, {scroll: false})
          }, 1000);
        }).catch(e => {
          store.dispatch(rejectContract(LISTING_NFT, e, listNewItem));
      }).finally(() => {
        setIsListing(false);
      })
    }
    else{
      const weiPerFrak = (wei.mul(utils.parseEther("1.0"))).div(fei);
      listItem(
        nftObject.id,
        fei,//shares
        weiPerFrak,//price
        provider,
        marketAddress,
        nftObject.name
      ).then(()=>{
          setInterval(() => {
              router.push(EXPLORE, null, {scroll: false})
          }, 1000);
        }).catch(e => {
          store.dispatch(rejectContract(LISTING_NFT, e, listNewItem));
      }).finally(() => {
        setIsListing(false);
      })
    }
  }

  async function prefraktionalize(id){
      try {
        let tx = await fraktionalize(id, provider, marketAddress);
        if (tx) {setPrepare(false)}
      }catch(e){
        console.error('There has been an error: ',e)
      }
  }
  async function predefraktionalize(id){ // leave it for after, will handle 'defraktionalized' nfts
      try {
        let tx = await defraktionalize(id, provider, marketAddress);
        if(tx){
          // let objectOverriden = {...nftObject, owner: contractAddress.toLocaleLowerCase()};
          // setNftObject(objectOverriden)
          setUnlocked(true)
        }
      }catch(e){
        console.error('There has been an error: ',e)
      }
  }
  async function approveContract(){
    approveMarket(marketAddress, provider, nftObject.id).then(()=>{
      setIsApproved(true)
    })
  }

  const onTabChange = (index) => {
    if(index == 0){
      setIsAuction(false);
    }
    if(index == 1){
      setIsAuction(true);
    }
  }

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
        <div className={styles.subheader}>{nftObject?nftObject.description:''}</div>

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
              <div style={{ marginTop: "8px" }} className={styles.cardHeader}>
                DATE OF CREATION
              </div>
              <div className={styles.cardText}>
                {nftObject?timezone(nftObject.createdAt):'loading'}
              </div>
            </div>
          </div>
          <Tabs isFitted variant='enclosed'
          onChange={onTabChange}
          >
            <TabList mb='1em'>
              <Tab>Fixed Price</Tab>
              <Tab>Auction</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <div className={styles.auctionCard}>
                <div style={{display: 'flex', flexDirection: "column"}}>
                  <div style={{display: 'flex', flexDirection: "row"}}>

                  <div style={{ marginRight: "52px" }}>
                    <div style={{display:'flex', margin: 'auto', flexDirection:'column'}}>
                      <div>
                        <div style={{ marginLeft: "24px" }}>
                          <div className={styles.contributeHeader}>Total price (ETH)</div>
                          <input
                            className={styles.contributeInput}
                            disabled={!nftObject}
                            type="number"
                            placeholder={totalPrice}
                            onChange={(e)=>{
                              setTotalPrice(e.target.value)
                            }}
                          />
                        </div>
                      </div>
                      <div >
                        <div style={{ marginLeft: "24px" }}>
                          <div className={styles.contributeHeader}>Fraktions</div>
                          <input
                            className={styles.contributeInput}
                            disabled={!nftObject || fraktions === 0}
                            type="number"
                            placeholder={fraktions}
                            onChange={(e)=>{
                              setTotalAmount(e.target.value);
                            }}
                          />
                          <div className={styles.contributeHeader}>Max: {fraktions}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={styles.auctionCardDivider} />
                  <div style={{ marginRight: "24px" }}>
                    <div className={styles.auctionCardHeader}>List properties</div>
                    <div className={styles.auctionCardDetailsContainer}>
                      <div style={{ marginRight: "60px" }}>
                        <div className={styles.auctionCardDetailsNumber}>{totalPrice}</div>
                        <div className={styles.auctionCardDetailsText}>ETH</div>
                      </div>
                      <div>
                        <div className={styles.auctionCardDetailsNumber}>{totalAmount}</div>
                        <div className={styles.auctionCardDetailsText}>Fraktions for sale</div>
                      </div>
                    </div>
                  </div>
                  </div>

                {/*nftObject?.owner !== contractAddress?.toLocaleLowerCase() ?
                  <div style={{marginTop: '16px'}}>
                    You need to lock the nft in the market to list the Fraktions!
                    <br />
                    {prepare && fraktions == "10000"?
                      <div style={{marginTop: '8px', display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>
                        {!isApproved ?
                          <FrakButton
                          disabled={fraktions === 0}
                          onClick={()=>approveContract()}>Approve</FrakButton>
                          :
                          <FrakButton
                          disabled={fraktions === 0}
                          onClick={()=>prefraktionalize(nftObject.marketId)}
                          >
                          Fraktionalize</FrakButton>
                        }
                        </div>
                      :
                      null
                      }
                  </div>
                  :
                  null
                */}

                {updating?
                  <FrakButton
                  style={{marginTop: '24px'}}
                  onClick={callUnlistItem}
                  >
                  Unlist
                  </FrakButton>
                  :
                  <div style={{margin: '24px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
                    {!isApproved ?
                      <FrakButton
                      disabled={fraktions === 0}
                      onClick={()=>approveContract()}>Approve</FrakButton>
                      :
                      null
                    }
                    <br />
                    <FrakButton
                    disabled={!fraktalReady}
                    style={{marginTop: '32px'}}
                    onClick={listNewItem}
                    >
                    List Item
                    </FrakButton>
                  </div>
                }
                </div>
                </div>
              </TabPanel>
              <TabPanel>
                <div className={styles.auctionCard}>
                <div style={{display: 'flex', flexDirection: "column"}}>
                  <div style={{display: 'flex', flexDirection: "row"}}>

                  <div style={{ marginRight: "52px" }}>
                    <div style={{display:'flex', margin: 'auto', flexDirection:'column'}}>
                      <div>
                        <div style={{ marginLeft: "24px" }}>
                          <div className={styles.contributeHeader}>{(isAuction)?"Reserve Price":"Total price"} (ETH)</div>
                          <input
                            className={styles.contributeInput}
                            disabled={!nftObject}
                            type="number"
                            placeholder={totalPrice}
                            onChange={(e)=>{
                              setTotalPrice(e.target.value)
                            }}
                          />
                        </div>
                      </div>
                      <div >
                        <div style={{ marginLeft: "24px" }}>
                          <div className={styles.contributeHeader}>Fraktions</div>
                          <input
                            className={styles.contributeInput}
                            disabled={!nftObject || fraktions === 0}
                            type="number"
                            placeholder={fraktions}
                            onChange={(e)=>{
                              setTotalAmount(e.target.value);
                            }}
                          />
                          <div className={styles.contributeHeader}>Max: {fraktions}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={styles.auctionCardDivider} />
                  <div style={{ marginRight: "24px" }}>
                    <div className={styles.auctionCardHeader}>List properties</div>
                    <div className={styles.auctionCardDetailsContainer}>
                      <div style={{ marginRight: "60px" }}>
                        <div className={styles.auctionCardDetailsNumber}>{totalPrice}</div>
                        <div className={styles.auctionCardDetailsText}>ETH</div>
                      </div>
                      <div>
                        <div className={styles.auctionCardDetailsNumber}>{totalAmount}</div>
                        <div className={styles.auctionCardDetailsText}>Frations for sale</div>
                      </div>
                    </div>
                  </div>
                  </div>

                {updating?
                  <FrakButton
                  style={{marginTop: '24px'}}
                  onClick={callUnlistItem}
                  >
                  Unlist
                  </FrakButton>
                  :
                  <div style={{margin: '24px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
                    {!isApproved ?
                      <FrakButton
                      disabled={fraktions === 0}
                      onClick={()=>approveContract()}>Approve</FrakButton>
                      :
                      null
                    }
                    <br />
                    <FrakButton
                    disabled={!fraktalReady}
                    style={{marginTop: '32px'}}
                    onClick={listNewItem}
                    >
                    {(isAuction)?"List Auction" : "List Item"}
                    </FrakButton>
                  </div>
                }
                </div>
                </div>
              </TabPanel>
            </TabPanels>
          </Tabs>

        </VStack>

      </div>
    </VStack>
  );
}
