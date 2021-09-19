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

interface NFTItemProps extends StackProps {
  item: FrakCard;
  CTAText?: string;
}

const NFTItemOS = forwardRef<HTMLDivElement, NFTItemProps>(
  ({ item, onClick, CTAText }, ref) => {

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
      >
        <Box minH='30rem' w='100%' position='relative' >
          <Image src={item.imageURL} width='100%' height='100%' style={{verticalAlign:'auto'}}/>
        </Box>
        <Center flexDirection='column' py='1.6rem'>
          <Text className='medium-16' mb='1.6rem'>
            {item.name}
          </Text>
          <Text className='medium-12' mb='1.6rem'>
            {item.token_schema}
          </Text>
            <FrakButton
              className='semi-16'
              py='.8rem'
              px='5.6rem'
            >
              {CTAText}
            </FrakButton>

        </Center>
      </VStack>
    );
  }
);

export default NFTItemOS;
