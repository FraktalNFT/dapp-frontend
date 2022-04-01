/**
 * REACT
 */

import React, { forwardRef } from "react";
/**
 * Cakra
 */
import { Image } from "@chakra-ui/image";
import { Box, StackProps, Text, VStack } from "@chakra-ui/layout";
import { FrakCard } from "../../types";

interface NFTItemProps extends StackProps {
  item: FrakCard;
  CTAText?: string;
  onCollateralRequest?: void;
};
/**
 * MFT Import Card
 */
const NFTImportCardOS = forwardRef<HTMLDivElement, NFTItemProps>(
  ({ item, onClick }, ref) => {
    return (
      <VStack
        cursor='pointer'
        overflow='hidden'
        maxW='30rem'
        rounded='md'
        onClick={onClick}
        ref={ref}
        sx={{transition: `all 0.25s`}}
        _hover={{transform: `translateY(-16px)`}}
      >
        <Box
            rounded="md"
            borderWidth="1px"
            boxShadow="md"
            height="350px"
            sx={{
              width: `100%`,
              placeItems: `center`,
            }}
        >

          <Image
              width="100%"
              height="100%"
              objectFit="cover"
              margin-left="auto"
              margin-right="auto"
              display="flex"
              sx={{
                objectFit: `cover`,
              }}
              style={{ verticalAlign: 'middle' }}
              src={item.imageURL}/>

        </Box>
        <Text mb='1.6rem' sx={{width: `100%`, padding: `0 1rem`, fontFamily: `Inter, sans-serif`, fontWeight: `700`}}>
          {item?.name}
        </Text>
      </VStack>
    );
  }
);

export default NFTImportCardOS;
