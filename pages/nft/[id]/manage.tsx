import { VStack } from "@chakra-ui/layout";
import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { BigNumber,utils } from "ethers";
import { Image } from "@chakra-ui/image";
import styles from "./manage.module.css";
import Button from "../../../components/button";
import FrakButton from '../../../components/button';
import {getSubgraphData, createObject, createListed} from '../../../utils/graphQueries';
import {shortenHash, timezone, getParams} from '../../../utils/helpers';
import { useWeb3Context } from '../../../contexts/Web3Context';
import {
  release,
  createRevenuePayment,
  lockShares,
  unlockShares,
  claimFraktalSold,
  voteOffer,
  defraktionalize,
  approveMarket,
  getApproved,
  getLocked
} from '../../../utils/contractCalls';


export default function ManageNFTView() {
  const {account, provider, contractAddress} = useWeb3Context();
  const [nftObject, setNftObject] = useState();
  const [raised, setRaised] = useState(0);
  const [revenues, setRevenues] = useState();
  const [offers, setOffers] = useState();
  const [fraktions, setFraktions] = useState(0);
  const [revenueValue, setRevenueValue] = useState(0)
  const [valueSetter, setValueSetter] = useState(false)
  const [view, setView] = useState("manage");
  const [index, setIndex] = useState();
  const [lockedFraktions, setLockedFraktions] = useState(0);
  const [buyer, setBuyer] = useState(false);
  const [approved, setApproved] = useState(false);

  const userBalance = () => nftObject.balances.find(x=>x.owner.id === account.toLocaleLowerCase())

  function getOwnershipPercenteage() {
    let perc;
    let obj = userBalance()
    // nftObject.balances.find(x=>x.owner.id === account.toLocaleLowerCase())
    if(obj && obj.amount > 0){
      perc = obj.amount/100
    }else{
      perc = 0
    }
    return perc;
  }
  async function revenueClaiming(){
    try {
      let tx = await release(provider, revenues[0].address)// only one here! change UI for a list of revenues
      }catch(e){
        console.log('There has been an error: ',e)
      }
    }

  async function defraktionalization() {
    // if owner == contractAddress.toLocaleLowerCase()
    let done = await approveMarket(contractAddress, provider, nftObject.id)
    if(done){
      defraktionalize(nftObject.marketId, provider, contractAddress);
    }
  }

  async function getIsApprovedForAll() {
    let approved = await getApproved(account, contractAddress, provider, nftObject.id);
    return approved;
  }

  useEffect(async () => {
    if(account && nftObject && contractAddress) {
      try {
        const approvedTokens = await getIsApprovedForAll();
        setApproved(approvedTokens);
        console.log('approved',approvedTokens);
      }catch(e){
        console.log('Error: ',e);
      }

    }
  },[account, nftObject, contractAddress])

  useEffect(async () => {
    if(account && nftObject){
      let locked = await getLocked(account, nftObject.id, provider);
      // console.log('locked ',locked);
      setLockedFraktions(locked)
    }
  },[account, nftObject])

  useEffect(async ()=>{
    const address = getParams('nft');
    const index = parseFloat(address.split('/manage')[0])
    if(index){
      setIndex(index)
    }
    let nftObjects;
    let obj = await getSubgraphData('marketid_fraktal',index)
    console.log('retrieved ',obj)
    if(obj.fraktalNfts[0].revenues.length){
      let revenuesValid = obj.fraktalNfts[0].revenues.filter(x=>{return x.value > 0 })
      setRevenues(revenuesValid)
    }
    nftObjects = await createObject(obj.fraktalNfts[0])
    setNftObject(nftObjects)
    // if(account){
    //   const bal = nftObjects.balances.find(x=>x.owner.id === account.toLocaleLowerCase())
    //   if(bal){
    //     setFraktions(bal.amount)
    //     let userHasLocked = bal.locked > 0
    //     setLockedFraktions(userHasLocked)
    //   }
    // }
    if(account && nftObjects){
      setRaised(nftObjects.raised)
      if(obj.fraktalNfts[0].offers.length){
        let offersValid = obj.fraktalNfts[0].offers.filter(x=>{return x.value > 0 })
        if(offersValid[0] && offersValid[0].value > 0){
          setOffers(offersValid)
          setView('offer')
        }
        if(obj.fraktalNfts[0].status.startsWith('sold')){
          setView('accepted')
          let winner = obj.fraktalNfts[0].status
          setBuyer(winner == account.toLocaleLowerCase())
        }
      }
    }
  },[account, index])
  const isOwned = nftObject?.owner === account?.toLocaleLowerCase();
  const listItemUrl = '/nft/'+index+'/list-item'

  async function launchRevenuePayment() {
    let valueIn = utils.parseEther((parseFloat(revenueValue)+0.000000001).toString())
    createRevenuePayment(valueIn, provider, nftObject.id);
  }

  async function cancelVote(index){
    unlockShares(offers[index].offerer.id, provider, nftObject.id)
  }

  async function voteOnOffer(index){
    voteOffer(offers[index].offerer.id, nftObject.id, provider, contractAddress)
  }

  async function claimFraktal(){
    claimFraktalSold(nftObject.marketId, provider, contractAddress)
  }

  async function approveContract(){
    let done = await approveMarket(contractAddress, provider, nftObject.id)
    if(done){
      setApproved(true)
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
        <div style={{textAlign:'center', fontWeight:'bold',fontSize:'21px',color:"grey"}}>
          {nftObject?nftObject.description:''}
        </div>
        {isOwned?
          <Link href={listItemUrl}>
            <div style={{display: 'flex', justifyContent: 'center'}}>
              <Button style={{color: 'white', background:'black', alignItems: 'center'}} >
                List item
              </Button>
            </div>
          </Link>
          :
          <div style={{textAlign: 'center', fontWeight:'bold', fontSize: '21px'}}>
            You can manage your listed item here
          </div>
        }
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "16px",
          }}
        >
          {view === "manage" || view === "offer" ? (
            <div>
              {view === "offer" && (
                <div>
                {offers.map((x,i)=>{return(
                  <div
                    key = {i}
                    className={styles.offerContainer}
                    style={{ marginBottom: "16px" }}
                  >
                    <div className={styles.offerInfo}>
                      Every holder votes and the majority decision (&gt;80%)
                      determines if the offer is accepted
                    </div>
                    <div className={styles.offerText}>
                      A buyer has offered {x.value/10**18} ETH for this NFT
                    </div>

                    {!approved ?
                      <div style={{textAlign:'center', marginTop:'30px'}}>
                        <FrakButton
                          disabled={fraktions === 0}
                          onClick={()=>approveContract()}>
                          Approve the market to vote!
                        </FrakButton>
                      </div>
                      :
                      <div className={styles.offerCTAContainer}>
                        <Button
                          isOutlined
                          disabled={lockedFraktions}
                          style={{
                            color: "#00C4B8",
                            borderColor: "#00C4B8",
                            width: "192px",
                            marginRight: "16px",
                          }}
                          onClick={()=>voteOnOffer(i)}
                        >
                          Accept
                        </Button>
                        <Button
                          isOutlined
                          disabled={!lockedFraktions}
                          onClick={()=>cancelVote(i)}
                          style={{
                            color: "#FF0000",
                            borderColor: "#FF0000",
                            width: "192px",
                          }}
                        >
                          Reject
                        </Button>
                      </div>
                    }
                  </div>
                )})}
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "center" }}>
                <div className={styles.redeemContainer}>
                  <div style={{ marginLeft: "16px" }}>
                    <div className={styles.redeemHeader}>OWNERSHIP</div>
                    <div className={styles.redeemAmount}>
                    {nftObject? getOwnershipPercenteage() +'%' : null}
                    </div>
                  </div>
                  <div style={{ marginLeft: "12px" }}>

                    <div className={styles.redeemHeader}>Gains</div>
                    <div className={styles.redeemAmount}>
                      {nftObject && revenues?.length? Math.round((revenues[0].value*getOwnershipPercenteage()/10**20)*1000)/1000 +'ETH' : 0}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <Image src={"/info.svg"} style={{ marginRight: "8px" }} />
                    {nftObject && fraktions == 10000 ?
                      <div
                        className={styles.redeemCTA}
                        style={{ backgroundColor: "#000", cursor: 'pointer' }}
                        onClick={()=>defraktionalization()}
                      >
                        DeFrak
                      </div>
                      : null}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ fontWeight: 500 }}>
              The offer for {Math.round((offers[0].value/10**18)*1000)/1000} ETH has been accepted. Your share is {getOwnershipPercenteage()}%
            </div>
          )}
        </div>

        <div className={styles.content}>
          {view === "accepted" ? (
            <div className={styles.claimContainer}>
              <div style={{ marginLeft: "24px" }}>
                <div className={styles.redeemHeader}>ETH</div>
                <div className={styles.redeemAmount}>{Math.round(((offers[0].value*getOwnershipPercenteage()/10**20))*1000)/1000}</div>
              </div>
              {buyer?
                <div
                className={styles.redeemCTA}
                style={{ backgroundColor: "#000" }}
                onClick={()=>claimFraktal()}
                >
                Claim Fraktal
                </div>
              :
                <div
                className={styles.redeemCTA}
                style={{ backgroundColor: "#000" }}
                onClick={()=>revenueClaiming()}
                >
                Claim
                </div>
              }
            </div>
          ) : (
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
                {valueSetter? 'Cancel' : 'Deposit Revenue'}
              </Button>
              {valueSetter &&
                <input
                  style={{
                    fontSize:'64px',
                    color: 'blue',
                    fontWeight:'bold',
                    textAlign:'center',
                    maxWidth:'130px',
                    marginRight:'10px',
                    marginLeft:'10px',
                    borderRadius: '8px',
                    background:'transparent'
                  }}
                  disabled={!nftObject}
                  type="number"
                  placeholder="ETH"
                  onChange={(e)=>{setRevenueValue(e.target.value)}}
                />
              }
              {valueSetter && revenueValue != 0 &&
                <Button
                  isOutlined
                  style={{
                    backgroundColor: "white",
                    marginRight: "16px",
                    width: "192px",
                  }}
                  onClick={()=>launchRevenuePayment()}
                >
                  {'Deposit'}
                </Button>
              }
{/*              // handle claims to do it for sold items and revenues*/}
              {!valueSetter &&
                <Button
                isOutlined
                disabled={!revenues}
                style={{ backgroundColor: "white", width: "192px" }}
                onClick={()=>revenueClaiming()}
                >
                Claim Gains
                </Button>
              }
            </div>
          )}
          <Image
            src={nftObject?nftObject.imageURL:exampleNFT.imageURL}
            w={"320px"}
            h={"320px"}
            borderRadius="4px"
          />
        </div>
      </div>
    </VStack>
  );
}
