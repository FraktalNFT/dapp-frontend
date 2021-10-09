import { HStack } from "@chakra-ui/layout";
import { utils } from "ethers";
import React, { forwardRef, useState, useEffect } from "react";
import Button from "../button";
import {
  voteOffer,
  getLocked,
  getApproved,
  unlockShares,
  // lockShares,
  approveMarket
} from '../../utils/contractCalls';
import { shortenHash, timezone } from '../../utils/helpers';
import {
  Tr,
  Td,
} from "@chakra-ui/react"

interface offerItemProps {
  account: String;
  offerItem: Object;
  tokenAddress: String;
  marketAddress: String;
  provider: Object;
}

const OfferDetail = forwardRef<HTMLDivElement, offerItemProps>(
  ({ account, offerItem, tokenAddress, marketAddress, provider }) => {
    const [fraktionsLocked, setFraktionsLocked] = useState(false);
    const [fraktionsApproved, setFraktionsApproved] = useState(false);

    useEffect(async () => {
      if(account && tokenAddress && offerItem.status != 'sold'){
        let locked = await getLocked(account, tokenAddress, provider);
        setFraktionsLocked(locked);
        let approved = await getApproved(account, marketAddress, provider, tokenAddress);
        setFraktionsApproved(approved);
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

    // async function claimFraktal(){
    //   claimFraktalSold(nftObject.marketId, provider, contractAddress).then(()=>router.reload());
    // }


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
          </Td>
        </Tr>
      </HStack>
    );
  }
);

export default OfferDetail;
