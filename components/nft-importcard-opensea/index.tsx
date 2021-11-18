import { Button } from "@chakra-ui/button";
import { Image } from "@chakra-ui/image";
import { Box, Center, StackProps, Text, VStack } from "@chakra-ui/layout";
import { formatEther } from "@ethersproject/units";
import React, { forwardRef } from "react";
import { FrakCard } from "../../types";
import FrakButton from "../button";
import NextLink from "next/link";
import {useState} from 'react';
import { useWeb3Context } from '../../contexts/Web3Context';
import {approveMarket, importERC721, importERC1155} from '../../utils/contractCalls';
import { claimNFT } from '../../utils/helpers';

interface NFTItemProps extends StackProps {
  item: FrakCard;
  CTAText?: string;
  onCollateralRequest?: void;
}

const NFTImportCardOS = forwardRef<HTMLDivElement, NFTItemProps>(
  ({ item, onClick, CTAText, onCollateralRequest }, ref) => {

    return (
      <VStack
        cursor='pointer'
        overflow='hidden'
        maxW='30rem'
        rounded='md'
        borderWidth='1px'
        borderColor='white.100'
        onClick={onClick}
        ref={ref}
        sx={{transition: `all 0.25s`}}
        _hover={{transform: `translateY(-16px)`}}
      >
        <Box minH='30rem' w='100%' position='relative' >
          <Image src={item.imageURL} width='100%' height='100%' style={{verticalAlign:'auto'}}/>
        </Box>
          <Text mb='1.6rem' sx={{width: `100%`, padding: `0 1rem`, fontFamily: `Inter, sans-serif`, fontWeight: `700`}}>
            {item?.name}
          </Text>
      </VStack>
    );
  }
);

export default NFTImportCardOS;
