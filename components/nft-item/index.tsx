import { Image } from "@chakra-ui/image";
import { Box, Center, HStack, StackProps, Text, VStack } from "@chakra-ui/layout";
import { formatEther } from "@ethersproject/units";
import { Flex, Spacer } from "@chakra-ui/react";
import React, { forwardRef } from "react";
import { FrakCard } from "../../types";

interface NFTItemProps extends StackProps {
  item: FrakCard;
  CTAText?: string;
}

const NFTItem = forwardRef<HTMLDivElement, NFTItemProps>(
  ({ item, onClick, CTAText }, ref) => {
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
          <Image src={item.imageURL} width='100%' height='100%' objectFit='cover' margin-left='auto' margin-right='auto' display='flex' maxH='35rem' style={{verticalAlign:'middle'}}/>
          {item.countdown && (
            <VStack
              spacing='0'
              rounded='lg'
              background='black.900'
              position='absolute'
              alignItems='flex-end'
              top='.8rem'
              right='.8rem'
              py='.6rem'
              px='.8rem'
              color='white'
            >
              <Text className='medium-upper-12'>Time Remaining</Text>
              <Text className='medium-16'>11:59:09</Text>
            </VStack>
          )}

          {item.contributions && (
            <Center
              w='100%'
              position='absolute'
              bottom='0'
              background='rgba(0, 0, 0, .8)'
              py='.6rem'
            >
              <Text className='regular-14' color='white'>
                {formatEther(item.contributions).toString()} Contributed
              </Text>
            </Center>
          )}
        </Box>
        </VStack>
        <Box margin="1rem">
          <Text className='semi-16' mb='1rem'>
            {item.name}
          </Text>
          <Flex>
          <Text className='medium-12'>
            23.95% Availabile
          </Text>
          <Spacer />
          <Image align="vertical" width="5" height="8" marginEnd="3px" src="https://ethereum.org/static/6b935ac0e6194247347855dc3d328e83/31987/eth-diamond-black.png" />
          <Text textAlign="end" className='medium-12'>
            0.325
          </Text>
          </Flex>
        </Box>
      </Box>
    );
  }
);

export default NFTItem;
