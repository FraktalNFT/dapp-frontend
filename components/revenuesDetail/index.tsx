import { HStack } from "@chakra-ui/layout";
import React, { forwardRef, useState, useEffect } from "react";
import { getReleased, getShares, release, getApproved, approveMarket } from '../../utils/contractCalls';
import { shortenHash, timezone } from '../../utils/helpers';

interface revenueItemProps {
  value: Number;
  account: String;
  date: Number;
  buyout: Boolean;
  tokenAddress: String;
  revenueAddress: String;
  creator: String;
  provider: any;
}

const RevenuesDetail = forwardRef<HTMLDivElement, revenueItemProps>(
  ({ account, date, value,creator,tokenAddress, buyout, revenueAddress, provider }) => {
    const [shares, setShares] = useState(0);
    const [released, setReleased] = useState(0);
    const [isClaiming, setIsClaiming] = useState(false);
    const [isApproved, setIsApproved] = useState(false);
    const [isApproving, setIsApproving] = useState(false);

    useEffect(async () => {
      if(buyout){
        let isApproved = await getApproved(account, revenueAddress, provider, tokenAddress)
        if(isApproved){
          setIsApproved(isApproved)
        }
      }
    }, [account, shares, released, buyout])

    useEffect(async () => {
      let userShares = await getShares(account, provider, revenueAddress);
      let userReleased = await getReleased(account, provider, revenueAddress);
      if(userShares){
        setShares(userShares)
      }
      if(userReleased){
        setReleased(userReleased/10**18)
      }
    }, [account, revenueAddress, provider])

    const isClaimable = () => {return shares > 0 && released == 0}; //shares*value/10000 !=

    async function approveFraktions(){
        setIsApproving(true);
        await approveMarket(revenueAddress, provider, tokenAddress);
        setIsApproving(false);
        setIsApproved(true)
    }

    // claim
    async function revenueClaiming(){
      setIsClaiming(true);
      try {
        release(provider, revenueAddress);
      }catch(e){
        console.log('There has been an error: ',e)
      }
      setIsClaiming(false);
    }

    return (
      <HStack style={{marginTop:'24px'}}>
        <div>{shortenHash(creator)}</div>
        <div>{timezone(date)}</div>
        {buyout &&
          <div>
            Item sold!
          </div>
        }
        <div>{value/10**18}</div>
        <img src={"/eth.png"} alt={'ETH'} style={{height:'26px', marginRight:'4px'}}/>
        {isClaimable() &&
          <div>
          {buyout && !isApproved ?
            <div
            style={{
              padding: '4px 16px',
              backgroundColor: "#00C49D",
              border: '2px solid #00C49D',
              borderRadius: '24px',
              height: '32px',
              justifyContent: 'center',
              fontFamily: 'Inter',
              fontWeight: 600,
              fontSize: '16px',
              lineHeight: '24px',
              color: '#FFFFFF',
              cursor: 'pointer'
            }}
            onClick={()=>approveFraktions()}
            >
            {isApproving? <div>Approving</div> : <div>Approve</div>}

            </div>
            :
            <div
            style={{
              padding: '4px 16px',
              backgroundColor: "#00C49D",
              border: '2px solid #00C49D',
              borderRadius: '24px',
              height: '32px',
              justifyContent: 'center',
              fontFamily: 'Inter',
              fontWeight: 600,
              fontSize: '16px',
              lineHeight: '24px',
              color: '#FFFFFF',
              cursor: 'pointer'
            }}
            onClick={()=>revenueClaiming()}
            >
            {isClaiming? <div>Claiming</div> : <div>Claim</div>}

            </div>
          }
          </div>
        }

      </HStack>
    );
  }
);

export default RevenuesDetail;
