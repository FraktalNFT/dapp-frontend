import { HStack } from "@chakra-ui/layout";
import { utils } from "ethers";
import React, { forwardRef, useState, useEffect } from "react";
import Button from "../button";
import {
  voteOffer,
  getLocked,
  unlockShares,
  claimFraktalSold,
  // lockShares,
  getApproved,
  approveMarket
} from '../../utils/contractCalls';
import { shortenHash, timezone } from '../../utils/helpers';
import {
  Tr,
  Td,
} from "@chakra-ui/react"

interface offerItemProps {
  account: String;
  fraktionsBalance: Number;
  offerItem: Object;
  tokenAddress: String;
  marketAddress: String;
  provider: Object;
  fraktionsApproved:Boolean;
}

const OfferDetail = forwardRef<HTMLDivElement, offerItemProps>(
  ({
    account,
    fraktionsBalance,
    offerItem,
    tokenAddress,
    marketAddress,
    provider,
    fraktionsApproved,
  }) => {
    const [fraktionsLocked, setFraktionsLocked] = useState(false);
    useEffect(async () => {
      if(account && tokenAddress && offerItem.status != 'sold'){
        let locked = await getLocked(account, tokenAddress, provider);
        setFraktionsLocked(locked);
      }
    },[account, tokenAddress, offerItem]);

    async function cancelVote(){
      unlockShares(account,offerItem.offerer.id, provider, tokenAddress);
    }

    async function voteOnOffer(){
      let tx = await voteOffer(offerItem.offerer.id, tokenAddress, provider, marketAddress)
    }

    async function approveContract(){
      let done = await approveMarket(marketAddress, provider, tokenAddress)
      if(done){
        setFraktionsApproved(true)
      }
    }
    async function claimFraktal() { // this one goes to offersCard
      try {
        await claimFraktalSold(tokenAddress, provider, marketAddress);
      }catch(e){
        console.log('There has been an error: ',e)
      }
    }

    return (
      <HStack style={{marginTop:'24px'}}>

        <Tr>
          <Td>
            {timezone(offerItem.timestamp)}
          </Td>
          <Td>
            {shortenHash(offerItem.offerer.id)}
          </Td>
          <Td>
            {offerItem.value > 0. ? utils.formatEther(offerItem.value) : 'Retrieved'} ETH
          </Td>
          <Td>
            {fraktionsBalance > 0 ?
              <div>
              {fraktionsApproved?
                <div>
                {fraktionsLocked ?
                  <Button
                    isOutlined
                    onClick={()=>cancelVote()}
                    style={{
                      color: "#FF0000",
                      borderColor: "#FF0000",
                      width: "192px",
                    }}
                  >
                    Reject
                  </Button>
                   :
                   <Button
                     isOutlined
                     style={{
                       color: "#00C4B8",
                       borderColor: "#00C4B8",
                       width: "192px",
                       marginRight: "16px",
                     }}
                     onClick={()=>voteOnOffer()}
                   >
                     Accept
                   </Button>
                 }
                 </div>
              :
                <Button
                  isOutlined
                  style={{
                    color: "#000000",
                    borderColor: "#00C4B8",
                    width: "192px",
                    marginRight: "16px",
                  }}
                  onClick={()=>approveContract()}
                >
                  Approve Fraktions
                </Button>
              }
              </div>
               :
                <div>buy Fraktions to vote!</div>
             }
             {/*if winner, should claim the fraktal from here*/}
             {offerItem.winner == true &&
               <div>
               <Button
                 isOutlined
                 style={{
                   color: "#000000",
                   borderColor: "#00C4B8",
                   width: "192px",
                   marginRight: "16px",
                 }}
                 onClick={()=>claimFraktal()}
               >
                 Claim bought Fraktal
               </Button>
               </div>
             }
          </Td>
        </Tr>
      </HStack>
    );
  }
);

export default OfferDetail;
