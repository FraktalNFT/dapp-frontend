import { HStack, Box, Text } from "@chakra-ui/react";
import { BigNumber, utils } from "ethers";
import React, { forwardRef, useState, useEffect } from "react";
import {
  getReleased,
  getShares,
  release,
  getApproved,
  approveMarket,
} from "../../utils/contractCalls";

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
  ({
    account,
    date,
    value,
    creator,
    tokenAddress,
    buyout,
    revenueAddress,
    provider,
  }) => {
    const [shares, setShares] = useState(0);
    const [released, setReleased] = useState(0);
    const [isClaiming, setIsClaiming] = useState(false);
    const [isApproved, setIsApproved] = useState(false);
    const [isApproving, setIsApproving] = useState(false);

    // const buyout = true;

    useEffect(() => {
      async function getData() {
        if (buyout) {
          let isApproved = await getApproved(
            account,
            revenueAddress,
            provider,
            tokenAddress
          );
          if (isApproved) {
            setIsApproved(isApproved);
          }
        }
      }
      getData();
    }, [account, shares, buyout]);

    useEffect(() => {
      async function getData() {
        let userShares = await getShares(account, provider, revenueAddress);
        let userReleased = await getReleased(account, provider, revenueAddress);
        // console.log({userShares,userReleased, revenueAddress});
        
        if (userShares) {
          setShares(userShares);
        }
        if (userReleased) {
          setReleased(userReleased / 10 ** 18);
        }
      }
      getData();
    }, [account, revenueAddress, provider]);

    const isClaimable = () => {
      return shares > 0 && released == 0;
    }; //shares*value/10000 !=

    async function approveFraktions() {
      setIsApproving(true);
      await approveMarket(revenueAddress, provider, tokenAddress);
      setIsApproving(false);
      setIsApproved(true);
    }

    // claim
    async function revenueClaiming() {
      setIsClaiming(true);
      try {
        release(provider, revenueAddress);
      } catch (e) {
        console.error("There has been an error: ", e);
      }
      setIsClaiming(false);
    }

    return (
      <HStack
        style={{
          marginTop: "24px",
          alignContent: `center`,
          alignItems: `center`,
          justifyContent: `space-between`,
        }}
      >
        <Text
          sx={{
            textTransform: `uppercase`,
            fontSize: `12px`,
            fontFamily: `Inter, sans-serif`,
            opacity: `0.77`,
            transform: `translateY(7.5%)`,
          }}
        >
          gains
        </Text>
        {/* value = total value, shares = shares the user has */}
        <div>{(value / 10 ** 18) * (Number(utils.formatEther(shares)) / 10000)} ETH</div>
        {isClaimable() && (
          <div>
            {buyout && !isApproved ? (
              <Box
                sx={{
                  padding: "4px 16px",
                  backgroundColor: "#00C49D",
                  border: "2px solid #00C49D",
                  borderRadius: "24px",
                  height: "32px",
                  width: `429.59px`,
                  fontFamily: "Inter",
                  fontWeight: 600,
                  fontSize: "16px",
                  lineHeight: "24px",
                  color: "#FFFFFF",
                  cursor: "pointer",
                  textAlign: `center`,
                  paddingTop: `2px`,
                }}
                onClick={() => approveFraktions()}
              >
                {isApproving ? `Approving` : `Approve`}
              </Box>
            ) : (
              <Box
                sx={{
                  padding: "4px 16px",
                  backgroundColor: "#00C49D",
                  border: "2px solid #00C49D",
                  borderRadius: "24px",
                  height: "32px",
                  width: `429.59px`,
                  justifyContent: "center",
                  fontFamily: "Inter",
                  fontWeight: 600,
                  fontSize: "16px",
                  lineHeight: "24px",
                  color: "#FFFFFF",
                  cursor: "pointer",
                  textAlign: `center`,
                  paddingTop: `2px`,
                }}
                onClick={() => revenueClaiming()}
              >
                {isClaiming ? `Claiming` : `Claim`}
              </Box>
            )}
          </div>
        )}
        {!isClaimable() && (
          <Box
            sx={{
              padding: "4px 16px",
              backgroundColor: "rgba(0,0,0,0.4)",
              border: "2px solid transparent",
              borderRadius: "24px",
              height: "32px",
              width: `429.59px`,
              justifyContent: "center",
              fontFamily: "Inter",
              fontWeight: 600,
              fontSize: "16px",
              lineHeight: "24px",
              color: "#FFFFFF",
              cursor: "pointer",
              textAlign: `center`,
              paddingTop: `2px`,
            }}
            _hover={{ cursor: `not-allowed` }}
          >
            {released == 0
              ? `You must own shares to claim`
              : `Already released`}
          </Box>
        )}
      </HStack>
    );
  }
);

export default RevenuesDetail;
