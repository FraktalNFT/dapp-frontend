import { Divider } from "@chakra-ui/react";
import { VStack, HStack, Box, Stack } from "@chakra-ui/layout";
import React, { useState, useEffect } from "react";
import { utils, BigNumber } from "ethers";
import FrakButton from "../button";
import FrakButton2 from "../button2";
import OfferDetail from "../offerDetail";
import { makeOffer, getMajority } from "../../utils/contractCalls";
import { Text } from "@chakra-ui/react";
import {connect} from "react-redux";
import {
    addAmount, OFFERING_BUYOUT, rejectContract,
    removeAmount
} from "../../redux/actions/contractActions";
import { roundUp } from "../../utils/math";

const BuyOutCard = ({
  account,
  tokenAddress,
  fraktionsBalance,
  minPrice,
  investors,
  offers,
  provider,
  marketAddress,
  fraktionsApproved,
  itemStatus,
  addEthAmount,
  removeEthAmount,
  buyOutRejected
}) => {
  const [isReady, setIsReady] = useState(false);
  const [valueToOffer, setValueToOffer] = useState("0");
  const [offering, setOffering] = useState(false);
  const [userIsOfferer, setUserIsOfferer] = useState(false);
  const [majority, setMajority] = useState(0);

  useEffect(() => {
    if (account && offers && offers.length) {
      let userHasOffered = offers.find(
        x => x.offerer.id == account.toLocaleLowerCase()
      );
      if (userHasOffered && userHasOffered.value > 0) {
        setUserIsOfferer(true);
      }
    }
  }, [account, offers]);

  useEffect(() => {
    async function getData() {
      if (tokenAddress && provider) {
        try {
          let tokenMajority = await getMajority(provider, tokenAddress);
          setMajority(tokenMajority / 100);
        } catch {
          console.error("Not yet fraktionalized");
        }
      }
    }
    getData();
  }, [tokenAddress, provider]);

  async function onOffer() {
    setOffering(true);
    try {
      addEthAmount(valueToOffer);
      await makeOffer(
        utils.parseEther(valueToOffer),
        tokenAddress,
        provider,
        marketAddress
      );
      setOffering(false);
      setValueToOffer("0");
    } catch (err) {
      buyOutRejected(err, onOffer);
    }
  }

  const minPriceParsed = (price) => roundUp(parseFloat(price), 3);

  function onSetValue(d) {
    if (utils.parseEther(d).gte(minPrice)) {
      setValueToOffer(d);
      setIsReady(true);
    } else {
      setIsReady(false);
    }
  }

  return (
    <div
      style={{
        borderRadius: "4px",
        borderWidth: "1px",
        borderColor: "#E0E0E0",
        padding: "16px",
        marginTop: "40px 0px",
      }}
    >
      <div
        style={{
          color: "#5A32F3",
          fontWeight: "bold",
          fontFamily: "Inter",
          fontSize: "24px",
          lineHeight: "29px",
        }}
      >
        NFT Buyout
      </div>
      <Box
        sx={{
          marginTop: `2rem`,
          display: `flex`,
          justifyContent: `space-between`,
          width: `100%`,
        }}
      >
        <VStack
          style={{
            alignItems: "flex-end",
          }}
        >
          <div
            style={{
              fontFamily: "Inter",
              fontWeight: 600,
              fontSize: "12px",
              lineHeight: "14px",
              letterSpacing: "1px",
              color: "#A7A7A7",
              alignSelf: "end",
            }}
          >
            INVESTORS
          </div>
          <div
            style={{
              fontFamily: "Inter",
              fontWeight: 600,
              fontSize: "32px",
              lineHeight: "40px",
              color: "#000000",
            }}
          >
            {investors}
          </div>
        </VStack>
        <Box
          sx={{
            display: `flex`,
            justifyContent: `flex-end`,
            alignItems: `center`,
            gap: `16px`,
          }}
        >
          <VStack
            style={{
              textAlign: "start",
              marginLeft: "24px",
            }}
          >
            <div
              style={{
                fontFamily: "Inter",
                fontWeight: 600,
                fontSize: "12px",
                lineHeight: "14px",
                letterSpacing: "1px",
                color: "#A7A7A7",
                alignSelf: "end",
              }}
            >
              MIN OFFER
            </div>
            <HStack>
              <img
                src="/eth.png"
                alt={"Eth"}
                style={{ height: "26px", marginRight: "4px" }}
              />
              <div
                style={{
                  fontFamily: "Inter",
                  fontWeight: 600,
                  fontSize: "32px",
                  lineHeight: "40px",
                  color: "#000000",
                }}
              >
                {minPriceParsed(utils.formatEther(minPrice))}
              </div>
            </HStack>
          </VStack>
          {userIsOfferer && (
            <FrakButton onClick={onOffer}>Removing Buy-out Offer</FrakButton>
          )}
          {!userIsOfferer && (
            <Stack
              style={{
                textAlign: "start",
                marginLeft: "24px",
              }}
            >
              <div
                style={{
                  fontFamily: "Inter",
                  fontWeight: 600,
                  fontSize: "12px",
                  lineHeight: "14px",
                  letterSpacing: "1px",
                  color: "#A7A7A7",
                }}
              >
                BUYOUT OFFER IN ETH
              </div>
              <FrakButton2
                isReady={isReady}
                onClick={onOffer}
                setFunction={onSetValue}
                currency={'ETH'}
              >
                {offering ? "Making Offer" : "Make Buy-out Offer"}
              </FrakButton2>
            </Stack>
          )}
        </Box>
      </Box>
      <div
        style={{
          fontWeight: 400,
          fontSize: "16px",
          lineHeight: "16px",
          marginTop: "24px",
          marginBottom: "32px",
          opacity: `0.75`,
        }}
      >
        {majority}% of the investors have to accept your offer for it to go
        through.
      </div>
      <Divider sx={{ borderColor: `#A7A7A7` }} />
      <div
        style={{
          fontSize: "20px",
          lineHeight: "24px",
          fontWeight: 300,
          marginTop: "12px",
        }}
      >
        Offers
      </div>
      <div>
        <>
          {offers?.length > 0 && itemStatus != "Retrieved" && (
            <>
              <Box sx={{ display: `flex` }}>
                <Text
                  w="116px"
                  sx={{
                    fontFamily: `Inter`,
                    opacity: `0.7`,
                    fontVariant: `small-caps`,
                    textTransform: `lowercase`,
                    minWidth: `116px`,
                  }}
                >
                  Date
                </Text>
                <Text
                  w="160px"
                  sx={{
                    fontFamily: `Inter`,
                    opacity: `0.7`,
                    fontVariant: `small-caps`,
                    textTransform: `lowercase`,
                    minWidth: `160px`,
                  }}
                >
                  Address
                </Text>
                <Text
                  w="80px"
                  sx={{
                    fontFamily: `Inter`,
                    opacity: `0.7`,
                    fontVariant: `small-caps`,
                    textTransform: `lowercase`,
                    textAlign: `right`,
                  }}
                >
                  Offer
                </Text>
                <Text
                  w="210px"
                  sx={{
                    fontFamily: `Inter`,
                    opacity: `0.7`,
                    fontVariant: `small-caps`,
                    textTransform: `lowercase`,
                    textAlign: `right`,
                  }}
                >
                  Action
                </Text>
              </Box>
              {offers?.map((offer, index) => (
                <OfferDetail
                  key={`offer-${index}`}
                  account={account}
                  offerItem={offer}
                  fraktionsBalance={fraktionsBalance}
                  tokenAddress={tokenAddress}
                  marketAddress={marketAddress}
                  provider={provider}
                  fraktionsApproved={fraktionsApproved}
                />
              ))}
            </>
          )}
          {offers?.length <= 0 && (
            <div style={{ marginTop: "24px" }}>
              There are no offers for this NFT.
            </div>
          )}
        </>
      </div>
    </div>
  );
};


const mapStateToProps = (state) => {
    return {
        contractTransaction: state.loadingScreen
    }
};
const mapDispatchToProps = (dispatch) => {
    return {
        addEthAmount: (amount) => {
            dispatch(addAmount(amount))
        },
        removeEthAmount: () => {
            dispatch(removeAmount())
        },
        buyOutRejected: (obj, buttonAction) => {
            dispatch(rejectContract(OFFERING_BUYOUT, obj, buttonAction))
        }
    }
};
export default connect(mapStateToProps, mapDispatchToProps)(BuyOutCard);
