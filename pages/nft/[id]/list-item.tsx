import { HStack, VStack } from "@chakra-ui/layout";
import React, {useEffect, useState} from "react";
import Head from "next/head";
import Link from "next/link";
import { BigNumber, utils } from "ethers";
import { Image } from "@chakra-ui/image";
import styles from "./auction.module.css";
import FrakButton from '../../../components/button';
import {shortenHash, timezone, getParams} from '../../../utils/helpers';
import {getSubgraphData, createObject, createListed} from '../../../utils/graphQueries';
import { useWeb3Context } from '../../../contexts/Web3Context';
import { listItem, lockShares, transferToken, unlockShares, unlistItem, fraktionalize, defraktionalize, approve } from '../../../utils/contractCalls';
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
  const {account, provider, contractAddress} = useWeb3Context();
  const [nftObject, setNftObject] = useState();
  const [index, setIndex] = useState();
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0.);
  const [fraktions, setFraktions] = useState(0);
  const [locked, setLocked] = useState(false);
  const [transferred, setTransferred] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [prepare, setPrepare] = useState(true);

  const fraktalReady = fraktions > 0
    && totalAmount > 0
    && totalAmount <= parseFloat(fraktions)
    && totalPrice > 0
    && isApproved
    && nftObject.owner === contractAddress.toLocaleLowerCase();

  useEffect(async ()=>{
    const address = getParams('nft');
    const indexString = address.split('/list-item')
    setIndex(parseFloat(indexString[0]))
    if(account){
      let listing = await getSubgraphData('listed_itemsId', `${account.toLocaleLowerCase()}-0x${indexString[0].toString(16)}`)
      if(listing && listing.listItems.length > 0){
        console.log('listing item',listing)
        setUpdating(true)
        setLocked(true)
        setTransferred(true)
        setUnlocked(true)
        let ownedFraktions = listing.listItems[0].fraktal.fraktions.find(x=> x.owner.id === account.toLocaleLowerCase())
        console.log('account has ',ownedFraktions)
        setFraktions(ownedFraktions.amount)
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
        } else {
          let obj = await getSubgraphData('marketid_fraktal',index)
          if(obj && obj.fraktalNfts){
            let nftObjects = await createObject(obj.fraktalNfts[0])
            if(nftObjects && account ){
              setNftObject(nftObjects)
              console.log('nftObjects',nftObjects)
              let userAmount = nftObjects.balances.find(x=>x.owner.id === account.toLocaleLowerCase())
              if(userAmount){
                setFraktions(userAmount.amount)
              }else {
                setFraktions(0)
              }
            }
          }
        }
      }
  },[index, account])

  async function callUnlistItem(){
    let tx = await unlistItem(
      index,
      provider,
      contractAddress)
    if(tx) {
      console.log('go to marketplace!')
    }
  }
  async function listNewItem(){
    let tx = await listItem(
      index,
      totalAmount,
      utils.parseUnits(totalPrice).div(totalAmount),
      provider,
      contractAddress)
    if(tx) {
      console.log('go to marketplace!')
    }
  }

  async function prefraktionalize(id){
      try {
        let tx = await fraktionalize(id, provider, contractAddress);
        if (tx) {setPrepare(false)}
      }catch(e){
        console.log('There has been an error: ',e)
      }
  }
  async function predefraktionalize(id){ // leave it for after, will handle 'defraktionalized' nfts
      try {
        let tx = await defraktionalize(id, provider, contractAddress);
        if(tx){
          let objectOverriden = {...nftObject, owner: contractAddress.toLocaleLowerCase()};
          setNftObject(objectOverriden)
          setUnlocked(true)
        }
      }catch(e){
        console.log('There has been an error: ',e)
      }
  }
  async function approveContract(){
    let done = await approve(contractAddress, provider, nftObject.id)
    if(done){
      setIsApproved(true)
    }
  }
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
        <div className={styles.subheader}>{nftObject?nftObject.description:''}</div>

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
                      onChange={(e)=>{setTotalPrice(e.target.value)}}
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
                      onChange={(e)=>{setTotalAmount(e.target.value)}}
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
                  <div className={styles.auctionCardDetailsText}>shares in sell</div>
                </div>
              </div>
            </div>
            </div>

          {nftObject?.owner !== contractAddress?.toLocaleLowerCase() ?
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
            <div style={{marginTop: '8px', display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>
              {!isApproved ?
                <FrakButton
                disabled={fraktions === 0}
                onClick={()=>approveContract()}>Approve</FrakButton>
                :
                'null (delete)'
              }
            </div>
          }

          {updating?
            <FrakButton
            style={{marginTop: '8px'}}
            onClick={callUnlistItem}
            >
            Unlist
            </FrakButton>
            :
            <FrakButton
            disabled={!fraktalReady}
            style={{marginTop: '32px'}}
            onClick={listNewItem}
            >
            List Item
            </FrakButton>
          }
          </div>
          </div>
        </HStack>

      </div>
    </VStack>
  );
}
