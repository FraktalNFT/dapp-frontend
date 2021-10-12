import { Image } from "@chakra-ui/image";
import { Box, Center, StackProps, Text, VStack, HStack } from "@chakra-ui/layout";
import { formatEther } from "@ethersproject/units";
import React, { forwardRef } from "react";
import { FrakCard } from "../../types";
// import FrakButton from "../button";

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
      <VStack
        cursor='pointer'
        overflow='hidden'
        maxW='30rem'
        rounded='md'
        borderWidth='1px'
        borderColor='white.100'
        onClick={onClick}
        ref={ref}
        _hover={{
          h: "40rem",
          w:'150%'
        }}
      >
        <Box
          h='35rem'
          w='100%'
          position='relative' >
          <Image src={imageURL} width='100%' height='100%' objectFit='cover' margin-left='auto' margin-right='auto' display='flex' maxH='35rem' style={{verticalAlign:'middle'}}/>
        </Box>
        <div style={{
          color:'#000000',
          fontFamily: 'Inter',
          alignSelf:'stretch',
          fontSize:'16px',
          lineHeight:'19px',
          fontWeight: 'bold',
          margin:'16px'
        }}>
          {name}
        </div>
        <HStack style={{
          fontSize:'14px',
          lineHeight:'20px',
          color:'#654464',
          justifyContent:'space-beween',
          marginBottom:'8px'
        }}>
          {amount &&
            <div>
            {amount/100}% Available
            </div>
          }
          {price &&
            <HStack>
            <img src={"/eth.png"} alt={'Eth'} style={{
              height:'18px',
              marginRight:'4px',
              opacity:'0.7'
            }}/>
            <div style={{textAlign:'right'}}>
            {price}
            </div>
            </HStack>
          }
        </HStack>


        {/*
        <Center flexDirection='column' py='1.6rem'>
          <Text className='medium-16' mb='1.6rem'>
            {item.name}
          </Text>
          <FrakButton className='semi-16' py='.8rem' px='5.6rem'>
            {CTAText || "Invest"}
          </FrakButton>
        </Center>
        */}
      </VStack>
    );
  }
);

export default NFTItem;
