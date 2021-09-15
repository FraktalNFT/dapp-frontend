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
    const { account, provider, contractAddress } = useWeb3Context();
    const [approving, setApproving] = useState(false);
    const [importing, setImporting] = useState(false);

    // const [fraktalNft, setFraktalNft] = useState(false);

    async function importNFT(item){
      setApproving(true)
      // console.log('importing',item.id);
      let done = await approveMarket(contractAddress, provider, item.id)
      if(done){
        setApproving(false)
        setImporting(true)
        let res;
        if(item.token_schema == 'ERC721'){
          res = importERC721(parseInt(item.tokenId), item.id, provider, contractAddress)
        }else {
          res = importERC1155(parseInt(item.tokenId), item.id, provider, contractAddress)
//
//        HERE important to filter fraktals to simply call 'fraktionalize' instead of importing as escrow
//
        // } else {
        //   res = fraktionalize(parseInt(item.marketId), provider, contractAddress) // tokenId is NOT what it goes!
        }
        if(res){
          setImporting(false)
        }
      }
    }
    const title = () =>{
      if(importing){
        return 'Importing'
      } else if (approving) {
        return 'Approving'
      // } else if(fraktalNft) {
      //   return 'Fraktionalize'
      }
      else {
        return 'Import'
      }
    }

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
              onClick={()=>importNFT(item)}
            >
              {title()}
            </FrakButton>

        </Center>
      </VStack>
    );
  }
);

export default NFTItemOS;
