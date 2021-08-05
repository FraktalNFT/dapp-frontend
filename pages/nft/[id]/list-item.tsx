import { HStack, VStack } from "@chakra-ui/layout";
import React, {useEffect, useState} from "react";
import Head from "next/head";
import Link from "next/link";
import { BigNumber, utils } from "ethers";
import { Image } from "@chakra-ui/image";
import styles from "./auction.module.css";
import FrakButton from '../../../components/button';
import {shortenHash, timezone} from '../../../utils/helpers';
import {getAccountFraktalNFTs, createObject, getNFTobject} from '../../../utils/graphQueries';
import { useWeb3Context } from '../../../contexts/Web3Context';
import { listItem, lockShares, transferToken, unlockShares } from '../../../utils/contractCalls';
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
  const [signer, setSigner] = useState();
  const [totalAmount, setTotalAmount] = useState(0.);
  const [totalPrice, setTotalPrice] = useState(0.);
  const [fraktions, setFraktions] = useState(0);
  const [locked, setLocked] = useState(false);
  const [transferred, setTransferred] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [updating, setUpdating] = useState(false);

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
  },[provider])

  const fraktalReady = fraktions > 0 && totalAmount >= fraktions && totalPrice > 0 && nftObject.owner === contractAddress.toLocaleLowerCase();

  useEffect(async ()=>{
    const address = window.location.href.split('http://localhost:3000/nft/');
    const index = parseFloat(address[1].split('/auction')[0])
    if(index){
      setIndex(index)
    }
    //first check that is not listed yet
    if(account){
      let listing = await getAccountFraktalNFTs('listed_itemsId', `${account.toLocaleLowerCase()}-0x${index+1}`)
      if(listing && listing.listItems.length > 0){
        setUpdating(true)
        let nftObject = await createObject(listing.listItems[0].fraktal)
        if(nftObject && account){
          setNftObject(nftObject)
          let userAmount = nftObject.balances.find(x=>x.owner.id === account.toLocaleLowerCase())
          if(userAmount){
            let parsedPrice = utils.formatEther(listing.listItems[0].price)
            let settedPrice = parsedPrice*listing.listItems[0].amount
            setTotalPrice(Math.round(settedPrice, 1))
            setTotalAmount(listing.listItems[0].amount)
            setFraktions(nftObject.balances[0].amount)
          }else {
            setFraktions(0)
          }
        }
      }else{
        let obj = await getAccountFraktalNFTs('marketid_fraktal',index)
        if(obj && obj.fraktalNFTs){
          let nftObjects = await createObject(obj.fraktalNFTs[0]) // its an array (?)
          if(nftObjects && account ){
            setNftObject(nftObjects)
            let userAmount = nftObjects.balances.find(x=>x.owner.id === account.toLocaleLowerCase())
            if(userAmount){
              setFraktions(nftObjects.balances[0].amount)
            }else {
              setFraktions(0)
            }
        }
      }
    }
      }
  },[index, account])
  async function listNewItem(){
    let confirmation = window.confirm('Do you want to list this item?');
    if (confirmation){
      let tx = await listItem(
        index,
        totalAmount,
        utils.parseUnits(totalPrice)/10000,
        'fixed',
        signer,
        contractAddress)
      if(tx) {
        console.log('go to marketplace! (where is navigation??)')
        window.location('http://localhost:3000/')
      }
    } else{
      console.log('event cancelled')
    }
  }

  async function lockingShares(id, amount, to){
      try {
        let tx = await lockShares(id, amount, to, signer, contractAddress);
        if (tx) {setLocked(true)}
      }catch(e){
        console.log('There has been an error: ',e)
      }
  }
  async function unlockingShares(id, amount, to){
      try {
        let tx = await unlockShares(id, amount, to, signer, contractAddress);
        if(tx){setUnlocked(true)}
      }catch(e){
        console.log('There has been an error: ',e)
      }
  }
  async function transferingToken(id, subId,amount,to){
    try {
      let tx = await transferToken(id, subId, amount, to, signer, contractAddress);
      if(tx){
        setTransferred(true)
        await unlockingShares(nftObject.id, 10000, contractAddress)
      }
    }catch(e){
      console.log('There has been an error: ',e)
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
                      type="number"
                      placeholder={totalAmount}
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
              You need to lock the nft in the market to list the fraktions!
              <br />
              <div style={{marginTop: '8px', display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>
              <FrakButton
              disabled={locked}
              onClick={()=>lockingShares(nftObject.id, 10000, contractAddress)}
                >
              Lock</FrakButton>
              <FrakButton
              disabled={transferred || !locked}
              onClick={()=>transferingToken(nftObject.id, 0,1,contractAddress)}>Transfer</FrakButton>
              {transferred?'Accept the tx for unlocking your fraktions':null}
              </div>
            </div>
            :null}

          <FrakButton
            disabled={!fraktalReady}
            style={{marginTop: '32px'}}
            onClick={listNewItem}
          >
          {updating? 'Update data':'List fraktals'}
          </FrakButton>
          </div>
          </div>
        </HStack>

      </div>
    </VStack>
  );
}
