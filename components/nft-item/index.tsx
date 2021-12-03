import { useState, useEffect } from "react";
import { Image } from "@chakra-ui/image";
import {
  Box,
  StackProps,
  Text,
  VStack,
  BoxProps,
  Spinner,
} from "@chakra-ui/react";
import React, { forwardRef } from "react";
import {
  Flex,
  Spacer,
  forwardRef as fRef,
  HTMLChakraProps,
  chakra,
} from "@chakra-ui/react";
import { FrakCard } from "../../types";
import { motion, isValidMotionProp, HTMLMotionProps } from "framer-motion";

interface NFTItemProps extends StackProps {
  item: FrakCard;
  name: String;
  amount: Number;
  price: Number;
  imageURL: String;
  CTAText?: string;
  wait: number;
}

const NFTItem = forwardRef<HTMLDivElement, NFTItemProps>(
  ({ item, amount, price, imageURL, name, onClick, CTAText, wait }, ref) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isImageLoaded, setIsImageLoaded] = useState(false);

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
    }, wait * Math.random());

    const visibleStyle = { opacity: `1` };
    const inVisibleStyle = { opacity: `0` };
    const inVisibleAnimStyle = {
      animationName: `loadingCard`,
      animationDuration: `1s`,
      "animation-iteration-count": `infinite`,
    };

    return (
      <>
        {isVisible && (
          <Box
            w="30rem"
            rounded="md"
            borderWidth="1px"
            boxShadow="md"
            onClick={onClick}
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
                {amount && (
                  <Text className="medium-12">{amount / 100}% Available</Text>
                )}

                <Spacer />
                <Image
                  align="vertical"
                  width="5"
                  height="8"
                  marginEnd="3px"
                  src="https://ethereum.org/static/6b935ac0e6194247347855dc3d328e83/31987/eth-diamond-black.png"
                />
                {price && (
                  <Text textAlign="end" className="medium-12">
                    {Math.round(price * 100000) / 100000}
                  </Text>
                )}
              </Flex>
            </Box>
          </Box>
        )}
      </>
    );
  }
);

export default NFTItem;
