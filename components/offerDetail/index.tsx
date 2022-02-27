import { utils } from 'ethers';
import React, { forwardRef, useState, useEffect } from 'react';
import {
  voteOffer,
  getLocked,
  unlockShares,
  claimFraktalSold,
  // lockShares,
  getApproved,
  approveMarket,
  rejectOffer,
} from '../../utils/contractCalls';
import { shortenHash, timezone } from '../../utils/helpers';
import { Box, Text, HStack } from '@chakra-ui/react';
import toast from 'react-hot-toast';
import store from '../../redux/store';
import {
  VOTING_BUYOUTS,
  CLAIMING_FRAKTIONS_PROFIT,
  rejectContract,
} from '../../redux/actions/contractActions';

interface offerItemProps {
  account: string;
  fraktionsBalance: number;
  offerItem: object;
  tokenAddress: string;
  marketAddress: string;
  provider: object;
  fraktionsApproved: boolean;
}

export default function OfferDetail({
  account,
  fraktionsBalance,
  offerItem,
  tokenAddress,
  marketAddress,
  provider,
  fraktionsApproved,
}) {
  const [fraktionsLocked, setFraktionsLocked] = useState(false);
  const [isOfferer, setIsOfferer] = useState<boolean>(false);
  console.log({ offerItem, tokenAddress });

  useEffect(() => {
    async function getData() {
      if (account && tokenAddress && offerItem.status != 'sold') {
        let lockedStr = await getLocked(account, tokenAddress, provider);
        let lockedNum = Number(lockedStr);
        let locked = !!lockedNum; //change truty to boolean
        console.log(lockedStr, lockedNum, locked);

        setFraktionsLocked(locked);
      }
    }
    getData();
  }, [account, tokenAddress, offerItem]);

  useEffect(() => {
    const properties = {
      account,
      fraktionsBalance,
      offerItem,
      tokenAddress,
      marketAddress,
      fraktionsApproved,
    };
    // console.log("Offer Item: ", offerItem);
    // console.log("Account: ", account);
    if (account?.length > 0 && offerItem?.offerer?.id?.length > 0) {
      if (account.toLocaleLowerCase() === offerItem?.offerer?.id) {
        setIsOfferer(true);
      }
    }
  }, [
    account,
    fraktionsBalance,
    offerItem,
    tokenAddress,
    marketAddress,
    fraktionsApproved,
  ]);

  /**
   * Reject Offer
   * @returns {Promise<void>}
   */
  async function cancelVote() {
    rejectOffer(
      account,
      offerItem.offerer.id,
      tokenAddress,
      provider,
      marketAddress
    );
  }

  /**
   * Vote Offer
   * @returns {Promise<void>}
   */
  async function voteOnOffer() {
    let response = await voteOffer(
      offerItem.offerer.id,
      tokenAddress,
      provider,
      marketAddress
    ).catch((e) => {
      store.dispatch(rejectContract(VOTING_BUYOUTS, e, voteOnOffer));
    });
  }

  async function approveContract() {
    toast('Approving...');
    let response = await approveMarket(marketAddress, provider, tokenAddress);
    if (response?.error) {
      toast.error('Approval Failed.');
    }
    if (!response?.error) {
      toast.success('Approval Successful.');
    }
    // if (done) {
    //   setFraktionsApproved(true);
    // }
  }

  /**
   * Claiming
   * @returns {Promise<void>}
   */
  async function claimFraktal() {
    // this one goes to offersCard
    try {
      let response = await claimFraktalSold(
        tokenAddress,
        provider,
        marketAddress
      ).catch((error) => {
        store.dispatch(
          rejectContract(CLAIMING_FRAKTIONS_PROFIT, error, claimFraktal)
        );
      });
    } catch (e) {
      console.error('There has been an error: ', e);
    }
  }

  const isCanceledOffer = () => offerItem.value <= 0;

  return (
    <>
      {offerItem?.offerer?.id.length > 0 && (
        <Box sx={{ display: `flex`, alignItems: `center`, margin: `8px 0` }}>
          <Text sx={{ minWidth: `116px` }}>
            {timezone(offerItem.timestamp)}
          </Text>
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
              : 'N/A'}
          </Text>
          <Box w="210px" sx={{ textAlign: `right` }}>
            {!isCanceledOffer() && fraktionsBalance <= 0 && !isOfferer && (
              <Text>Buy Fraktions to vote!</Text>
            )}
            {!isCanceledOffer() &&
              fraktionsBalance > 0 &&
              !isOfferer &&
              !!offerItem?.winner && <Text>Pending Buyer Claiming NFT</Text>}
            {isCanceledOffer() && <Text>Canceled</Text>}
            {!isCanceledOffer() && fraktionsBalance > 0 && !fraktionsApproved && (
              <Box
                sx={{
                  borderColor: '#00C4B8',
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
            {!isCanceledOffer() &&
              fraktionsBalance > 0 &&
              fraktionsApproved &&
              !fraktionsLocked && (
                <Box
                  sx={{
                    borderColor: '#00C4B8',
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
            {fraktionsBalance > 0 &&
              !isCanceledOffer() &&
              fraktionsApproved &&
              !fraktionsLocked &&
              !offerItem?.winner && (
                <Box
                  sx={{
                    border: `2px solid red`,
                    fontSize: `16px`,
                    display: `inline-block`,
                    boxSizing: `border-box`,
                    backgroundColor: `white`,
                    padding: `4px 16px`,
                    marginLeft: `8px`,
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
              )}
            {offerItem?.winner && isOfferer && (
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
            )}
          </Box>
        </Box>
      )}
    </>
  );
}
