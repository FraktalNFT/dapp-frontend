import React, { useState, useEffect } from "react";
import { Box, Grid, HStack, VStack, Text, Spinner, Input, InputGroup,InputLeftAddon, Button,useToast } from "@chakra-ui/react";
import Head from "next/head";
import { useWeb3Context } from "../contexts/Web3Context";
import { useRouter } from "next/router";
import { useENSAddress } from 'components/useENSAddress';
import { claimPartnerAirdrop } from '@/utils/contractCalls';
import { getAddressAirdrop } from '@/utils/graphQueries';
import {getProofs2} from '../utils/proofsGetter'
import Countdown from 'react-countdown';


const Completionist = () => <span></span>;
const renderer = ({ hours, minutes, seconds, completed }) => {
  if (completed) {
    // Render a completed state
    return <Completionist />;
  } else {
    // Render a countdown
    return <span>In {hours} hours {minutes} minutes :{seconds} seconds</span>;
  }
};

export default function ClaimBonus() {
  const { account, loading, partnerAirdropAddress, provider } = useWeb3Context();
  const [inputAddress, setInputAddress] = useState("");
  const [listedAddress, setListedAddress] = useState("");
  const [proofs,setProofs] = useState("");
  const [checkedEligible, setCheckedEligible] = useState(false);
  const [eligible, setEligible] = useState(true);
  const toast = useToast()

  useEffect(() => {
      setInputAddress(account);
      setCheckedEligible(false);
      setEligible(true);
      // setProofs(getProofs(account));
  }, [account]);

  useEffect(() => {
      setCheckedEligible(false);
      setEligible(true);
      // setProofs(getProofs(account));
  }, [inputAddress]);

  const claimHandle = async () => {
    if(inputAddress == "" ){
        toast({
            title: `Some input missing`,
            status: "error",
            isClosable: true,
            position: "top",
          })
        return;
    }

    if(checkedEligible && eligible){
      const data = getProofs2(inputAddress);
      await userClaimAirdrop(data.amount, data.hexProof);
    }else{
      const data = getProofs2(inputAddress);
      console.log(data);
      setCheckedEligible(true);
      if(data === undefined){
        setEligible(false);
        toast({
            title: `Not eligible to claim...`,
            status: "warning",
            isClosable: true,
            position: "top",
          })
      }else{
          toast({
              title: `Eligible to claim ${data.amount} FRAKs. Claim now!`,
              status: "success",
              isClosable: true,
              position: "top",
            })
          
      }

    }
    
  }
  
  const onInputAddressChange = (event) => {
    setInputAddress(event.target.value);
  }

  const userClaimAirdrop = async (_amount,_proof) => {
      try{
        console.log("Amount :",_amount,_proof);
        await claimPartnerAirdrop(_amount,_proof,provider,"0x19B56b1Ea1522509B7Ab260cBC3989D8Dc024837");
        
      }
      catch(error){
        toast({
            title: error.error.message,
            status: "error",
            isClosable: true,
            position: "top",
          });
          console.log({error});
      }
    
  }
//1648382400000
  return (
    <VStack spacing="0" mb="12.8rem">
      <Head>
        <title>Fraktal - Bonus Airdrop</title>
      </Head>
      <VStack w="96.4rem" spacing="0" justifyContent="space-between" mb="4rem">
        <Text className="semi-48">Bonus Hodler Airdrop 💎🤲</Text><Countdown date={1648382400000} renderer={renderer}/>,
        <Text fontSize='xl'>Check if your address eligible for the airdrop</Text>
      </VStack>
      <>
        <InputGroup>
            <InputLeftAddon children='Your address:' />
            <Input onChange={onInputAddressChange} value={inputAddress}/>
        </InputGroup>
        <Box height={"10px"} />
        <Button colorScheme={checkedEligible?"green":"blue"} size='lg' onClick={claimHandle} disabled={!eligible} >
            {checkedEligible?"Claim!":"Check"}
        </Button>
      </>
    </VStack>
  );
}
