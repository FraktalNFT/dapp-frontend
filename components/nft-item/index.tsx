import { Image } from "@chakra-ui/image";
import { Box, StackProps, Text, VStack } from "@chakra-ui/layout";
import React, { forwardRef } from "react";
import { Flex, Spacer } from "@chakra-ui/react";
import { FrakCard } from "../../types";

interface NFTItemProps extends StackProps {
  item: FrakCard;
  name: String;
  amount: Number;
  price: Number;
  imageURL: String;
  CTAText?: string;
}

const NFTItem = forwardRef<HTMLDivElement, NFTItemProps>(
  ({ item, amount, price, imageURL, name, onClick, CTAText }, ref) => {
    return (
      <Box
        maxW='30rem'
        rounded='md'
        borderWidth='1px'
        boxShadow="md"
        onClick={onClick}
        _hover={{
          boxShadow: "xl"
        }}
        ref={ref}>
      <VStack
        cursor='pointer'
      >
        <Box
          h='35rem'
          w='100%'
          position='relative' >
          <Image src={imageURL} width='100%' height='100%' objectFit='cover' margin-left='auto' margin-right='auto' display='flex' maxH='35rem' style={{verticalAlign:'middle'}}/>

        </Box>
        </VStack>
        <Box margin="1rem">
          <Text className='semi-16' mb='1rem'>
            {name}
          </Text>
          <Flex>
          {amount &&
            <Text className='medium-12'>
            {amount/100}% Available
            </Text>
          }

          <Spacer />
          <Image align="vertical" width="5" height="8" marginEnd="3px" src="https://ethereum.org/static/6b935ac0e6194247347855dc3d328e83/31987/eth-diamond-black.png" />
          {price &&
            <Text textAlign="end" className='medium-12'>
            {Math.round(price*100000)/100000}
            </Text>
          }
          </Flex>
        </Box>
      </Box>

    );
  }
);

export default NFTItem;
