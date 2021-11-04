import { utils } from "ethers";
import React, { forwardRef, useState, useEffect } from "react";
import {
  voteOffer,
  getLocked,
  unlockShares,
  claimFraktalSold,
  // lockShares,
  getApproved,
  approveMarket,
} from "../../utils/contractCalls";
import { shortenHash, timezone } from "../../utils/helpers";
import { Box, Text, HStack } from "@chakra-ui/react";

interface offerItemProps {
  account: String;
  fraktionsBalance: Number;
  offerItem: Object;
  tokenAddress: String;
  marketAddress: String;
  provider: Object;
  fraktionsApproved: Boolean;
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
    useEffect(() => {
      async function getData() {
        if (account && tokenAddress && offerItem.status != "sold") {
          let locked = await getLocked(account, tokenAddress, provider);
          setFraktionsLocked(locked);
        }
      }
      getData();
    }, [account, tokenAddress, offerItem]);

    async function cancelVote() {
      unlockShares(account, offerItem.offerer.id, provider, tokenAddress);
    }

    async function voteOnOffer() {
      let tx = await voteOffer(
        offerItem.offerer.id,
        tokenAddress,
        provider,
        marketAddress
      );
    }

    async function approveContract() {
      let done = await approveMarket(marketAddress, provider, tokenAddress);
      // if (done) {
      //   setFraktionsApproved(true);
      // }
    }
    async function claimFraktal() {
      // this one goes to offersCard
      try {
        await claimFraktalSold(tokenAddress, provider, marketAddress);
      } catch (e) {
        console.log("There has been an error: ", e);
      }
    }

    return (
      <Box sx={{ display: `flex`, alignItems: `center`, margin: `8px 0` }}>
        <Text sx={{ minWidth: `116px` }}>{timezone(offerItem.timestamp)}</Text>
        <Text
          sx={{
            minWidth: `160px`,
            color: `hsla(224, 86%, 51%, 1)`,
          }}
        >
          <a
            href={`https://etherscan.io/address/${offerItem.offerer.id}`}
            rel="nofollow"
            target="_blank"
          >
            {shortenHash(offerItem.offerer.id)}
          </a>
        </Text>
        <Text w="80px" sx={{ textAlign: `right` }}>
          {offerItem.value > 0
            ? `${utils.formatEther(offerItem.value)} ETH`
            : "N/A"}
        </Text>
        <Box w="210px" sx={{ textAlign: `right` }}>
          {fraktionsBalance >= 1 ? (
            <div>
              {fraktionsApproved ? (
                <div>
                  {fraktionsLocked ? (
                    <div>
                      {offerItem.winner ?
                        <Box
                          sx={{
                            border: `2px solid green`,
                            fontSize: `16px`,
                            display: `inline-block`,
                            boxSizing: `border-box`,
                            backgroundColor: `white`,
                            padding: `4px 16px`,
                            color: `green`,
                            fontWeight: `500`,
                            fontFamily: `Inter`,
                            borderRadius: `24px`,
                          }}
                          _hover={{ cursor: `pointer` }}
                          onClick={() => claimFraktal()}
                        >
                          Claim
                        </Box>
                        :
                        <Box
                          sx={{
                            border: `2px solid red`,
                            fontSize: `16px`,
                            display: `inline-block`,
                            boxSizing: `border-box`,
                            backgroundColor: `white`,
                            padding: `4px 16px`,
                            color: `red`,
                            fontWeight: `500`,
                            fontFamily: `Inter`,
                            borderRadius: `24px`,
                          }}
                          _hover={{ cursor: `pointer` }}
                          onClick={() => cancelVote()}
                        >
                          Reject
                        </Box>
                      }
                    </div>
                  ) : (
                    <Box
                      sx={{
                        borderColor: "#00C4B8",
                        fontSize: `16px`,
                        display: `inline-block`,
                        boxSizing: `border-box`,
                        backgroundColor: `hsla(168, 100%, 38%, 1)`,
                        padding: `4px 16px`,
                        color: `white`,
                        fontWeight: `500`,
                        fontFamily: `Inter`,
                        borderRadius: `24px`,
                      }}
                      _hover={{ cursor: `pointer` }}
                      onClick={() => voteOnOffer()}
                    >
                      Accept
                    </Box>
                  )}
                </div>
              ) : (
                <Box
                  sx={{
                    borderColor: "#00C4B8",
                    fontSize: `16px`,
                    display: `inline-block`,
                    boxSizing: `border-box`,
                    backgroundColor: `hsla(168, 100%, 38%, 1)`,
                    padding: `4px 16px`,
                    color: `white`,
                    fontWeight: `500`,
                    fontFamily: `Inter`,
                    borderRadius: `24px`,
                  }}
                  _hover={{ cursor: `pointer` }}
                  onClick={() => approveContract()}
                >
                  Approve Fraktions
                </Box>
              )}
            </div>
          ) : (
            <div>buy Fraktions to vote!</div>
          )}
        </Box>
      </Box>
    );
  }
);

export default OfferDetail;
