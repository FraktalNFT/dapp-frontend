import { useState, useEffect } from "react";
import NextLink from "next/link";
import { Image } from "@chakra-ui/image";
import {
  Box,
  StackProps,
  Text,
  VStack,
  BoxProps,
  Spinner,
  Badge,
} from "@chakra-ui/react";
import React, { forwardRef } from "react";
import {
  Flex,
  Button,
  Spacer,
  forwardRef as fRef,
  HTMLChakraProps,
  chakra,
} from "@chakra-ui/react";
import { FrakCard } from "../../types";
import { motion, isValidMotionProp, HTMLMotionProps } from "framer-motion";
import FrakButton from "../../components/button";
import { useUserContext } from "@/contexts/userContext";
import Countdown,{zeroPad} from 'react-countdown';

interface NFTItemProps extends StackProps {
  item: any;
  name: string;
  amount: any;
  price: Number;
  imageURL: string;
  // CTAText?: string;
  // wait: number;
  endTime: number;
  reservePriceReached: any;
}

const NFTAuctionItem = forwardRef<HTMLDivElement, NFTItemProps>(
  ({ item, amount, price, imageURL, name, onClick, CTAText, wait, endTime, showProgress, claimType,claimFunction, unlistFunction, reservePriceReached }, ref) => {
    const [isVisible, setIsVisible] = useState(false);
    const [timerOpacity,setTimerOpacity] = useState(0);
    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const { fraktions } = useUserContext();
    const [ended,setEnded] = useState(false);

    // const canList = item && !! (fraktions || []).find(fraktion => fraktion.id === item.id);

    // useEffect(() => {
    //   setIsImageLoaded(false);
    // }, []);

    const onImageLoad = (ms: number) => {
      setTimeout(() => {
        setIsImageLoaded(true);
      }, ms);
    };


    setTimeout(() => {
      setIsVisible(true);
    }, 0);

    const visibleStyle = { opacity: `1` };
    const inVisibleStyle = { opacity: `0` };
    const inVisibleAnimStyle = {
      animationName: `loadingCard`,
      animationDuration: `1s`,
      animationIterationCount: `infinite`,
    };

    const renderer = ({ days, hours, minutes, seconds, completed })=>{
      if (completed) {
        // Render a completed state
        setEnded(true);
        return <div>Ended</div>;
      } else {
        // Render a countdown
        if(days>0){
          return <span>{days} days :{zeroPad(hours)} hours</span>;
        }
        if(hours>0){
          return <span>{zeroPad(hours)} hours:{zeroPad(minutes)} mins</span>;
        }
        return <span>{zeroPad(minutes)} mins:{zeroPad(seconds)} secs</span>;
      }
    }

    return (
      <>
        {isVisible && (
          <Box
            w="30rem"
            rounded="md"
            borderWidth="1px"
            boxShadow="md"
            _hover={{
              boxShadow: "xl",
            }}
            ref={ref}
            sx={isImageLoaded ? null : inVisibleAnimStyle}
          >
            <VStack cursor="pointer">
              <Box
                h={isImageLoaded ? "35rem" : "0px"}
                w="100%"
                position="relative"
                sx={
                  isImageLoaded
                    ? visibleStyle
                    : inVisibleStyle /* toggle visibility */
                }
              >
                <Image
                  src={imageURL}
                  width="100%"
                  height="100%"
                  objectFit="cover"
                  margin-left="auto"
                  margin-right="auto"
                  display="flex"
                  sx={{
                    objectFit: `cover`,
                  }}
                  style={{ verticalAlign: "middle" }}
                  onLoad={() => onImageLoad(2000)}
                  onClick={onClick}
                />
              </Box>
              {!isImageLoaded && (
                <Box
                  h="35rem"
                  w="100%"
                  position="relative"
                  sx={
                    !isImageLoaded /* inverse of image visibility */
                      ? visibleStyle
                      : inVisibleStyle /* toggle visibility */
                  }
                >
                  <Box
                    sx={{
                      display: "grid",
                      width: `100%`,
                      height: `100%`,
                      placeItems: `center`,
                    }}
                  >
                    <Spinner size="xl" />
                  </Box>
                </Box>
              )}
            </VStack>
            <Box margin="1rem">
              <Text className="semi-16" mb="1rem">
                {name}
              </Text>
              <Flex>
                {(amount!=0) && (
                  <Text className="medium-12">{amount==0?"Not":`${amount / 100}%`} Available</Text>
                )}

                <Spacer />
                {endTime&&<Image
                  align="vertical"
                  width="5"
                  height="5"
                  marginEnd="5px"
                  marginTop="5px"
                  src="timer.png"
                />}
                <Countdown renderer={renderer} date={Number(endTime)*1000} autoStart
                />
              </Flex>

              {showProgress && item.isAuctionSuccess && (
                <Badge fontSize='md' colorScheme='green'>Success</Badge>
              )}
              {showProgress && !item.isAuctionSuccess && (
                <Badge fontSize='md' colorScheme='red'>Reserve not met</Badge>
              )}




              { showProgress && ended && claimType=="seller" &&(
                <Box textAlign="center" marginTop={5}>
                    {item.currentReserve==0 &&(
                      <FrakButton disabled onClick={()=>claimFunction(item.tokenAddress,item.seller,item.sellerNonce)}
                      >Nothing to claim</FrakButton>
                    )
                    }
                    {item.currentReserve!=0 && item.isAuctionSuccess && (
                      <FrakButton onClick={()=>claimFunction(item.tokenAddress,item.seller,item.sellerNonce)}
                      >Claim {item.currentReserve} ETH</FrakButton>
                    )
                    }
                    {item.currentReserve!=0 && !item.isAuctionSuccess && (
                      <FrakButton onClick={()=>claimFunction(item.tokenAddress,item.seller,item.sellerNonce)}
                      >Claim Deposited Fraktions</FrakButton>
                    )
                    }

                </Box>
              )}
              { showProgress && ended && claimType=="participant" &&(
                <Box textAlign="center" marginTop={5}>
                {item.contributed != 0 && item.isAuctionSuccess && (
                  <FrakButton  onClick={()=>claimFunction(item.tokenAddress,item.seller,item.sellerNonce)}
                  >Claim Fraktions</FrakButton>
                )}
                {item.contributed != 0 && !item.isAuctionSuccess &&(
                  <FrakButton  onClick={()=>claimFunction(item.tokenAddress,item.seller,item.sellerNonce)}
                  >Claim Contributed ETH</FrakButton>
                )}
                {item.contributed == 0 &&(
                  <FrakButton disabled onClick={()=>claimFunction(item.tokenAddress,item.seller,item.sellerNonce)}
                  >Claimed</FrakButton>
                )}
                </Box>
              )}
              { showProgress && !ended && claimType=="seller" && (
                <Box textAlign="center" marginTop={5}>
                  <Button disabled >In Progress</Button>
                  <Button size={'lg'} onClick={()=>unlistFunction(item.tokenAddress,item.sellerNonce)} >
                    End Auction
                  </Button>
                </Box>
              )}
              { showProgress && !ended && claimType=="participant" && (
                <Box textAlign="center" marginTop={5}>
                  <Button disabled >In Progress</Button>
                </Box>
              )}
            </Box>
          </Box>
        )}
      </>
    );
  }
);

export default NFTAuctionItem;
