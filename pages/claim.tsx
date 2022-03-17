import React, { useState, useEffect } from "react";
import { Box, Grid, HStack, VStack, Text, Spinner, Input, InputGroup,InputLeftAddon, Button,useToast } from "@chakra-ui/react";
import Head from "next/head";
import { useWeb3Context } from "../contexts/Web3Context";
import { useRouter } from "next/router";
import { useENSAddress } from 'components/useENSAddress';
import { claimAirdrop } from '@/utils/contractCalls';
import { getAddressAirdrop } from '@/utils/graphQueries';

export default function ArtistsView() {
  const router = useRouter();
  const SORT_TYPES = ["Popular", "New"];
  const [selectionMode, setSelectionMode] = useState(false);
  const [sortType, setSortType] = useState("Popular");
  const [artists, setArtists] = useState([]);
  const [artistsItems, setArtistsItems] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const { account, loading, airdropAddress, provider } = useWeb3Context();
  const [artistAddress, setArtistAddress] = useState("");
  const [inputAddress, setInputAddress] = useState("");
  const [listedAddress, setListedAddress] = useState("");
  const toast = useToast()

  useEffect(() => {
      setInputAddress(account);
  }, [account]);

  const claimHandle = async () => {
    if(inputAddress == "" || listedAddress == ""){
        toast({
            title: `Some input missing`,
            status: "error",
            isClosable: true,
            position: "top",
          })
        return;
    }
    const data = await getAddressAirdrop(inputAddress);
    console.log(data);
    if(data.airdrop == null){
        toast({
            title: `Not eligible for claim`,
            status: "error",
            isClosable: true,
            position: "top",
          })
    }else{
        console.log(data);
        await userClaimAirdrop(data.airdrop.amount, data.airdrop.proof,listedAddress);
    }
  }
  
  const onInputAddressChange = (event) => {
    setInputAddress(event.target.value);
  }

  const onListedTokenChange = (event) => {
      setListedAddress(event.target.value);
  }

  const userClaimAirdrop = async (_amount,_proof,_listedToken) => {
      try{
        await claimAirdrop(_amount,_proof,_listedToken,provider,airdropAddress);
      }
      catch(error){
        toast({
            title: error.message,
            status: "error",
            isClosable: true,
            position: "top",
          });
          console.log(error);
      }
    
  }

  return (
    <VStack spacing="0" mb="12.8rem">
      <Head>
        <title>Fraktal - Claim</title>
      </Head>
      <HStack w="96.4rem" spacing="0" justifyContent="space-between" mb="4rem">
        <Text className="semi-48">Claim Fraktal (manually)</Text>
        

      </HStack>
      <>
        <InputGroup>
            <InputLeftAddon children='Your address:' />
            <Input onChange={onInputAddressChange} value={inputAddress}/>
        </InputGroup>
        <InputGroup >
            <InputLeftAddon children='Your listed Fraktal token address:' />
            <Input onChange={onListedTokenChange} value={listedAddress}/>
        </InputGroup>
        <Button colorScheme='blue' size='lg' onClick={claimHandle} >
            Claim
        </Button>
      </>
    </VStack>
  );
}
