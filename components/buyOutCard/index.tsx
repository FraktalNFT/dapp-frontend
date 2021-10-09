import { Divider } from "@chakra-ui/react"
import { VStack, HStack } from "@chakra-ui/layout";
import React, { useState } from "react";
import { utils } from "ethers";
import FrakButton2 from '../button2';
import OfferDetail from '../offerDetail';
import { makeOffer } from '../../utils/contractCalls';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Td,
} from "@chakra-ui/react"

const BuyOutCard=(({account, tokenAddress, minPrice, investors, offers, provider, marketAddress}) => {
  const [isReady, setIsReady] = useState(false);
  const [valueToOffer, setValueToOffer] = useState(0);
  const [offering, setOffering] = useState(false);

  // functions for the offers!
  //vote
  //unvote
  //claim Fraktal

  async function onOffer(){
    setOffering(true)
    try {
      let tx = await makeOffer(
        utils.parseEther(valueToOffer),
        tokenAddress,
        provider,
        marketAddress)
      tx.then(()=>{
        setOffering(false)
        setValueToOffer(0)
      });
      }catch(err){
        console.log('Error',err);
      }
  }

  function onSetValue(d){
    if(parseFloat(d) && parseFloat(d) >= minPrice){
      setValueToOffer(d);
      setIsReady(true);
    } else {
      setIsReady(false);
    }
  }

  return(
    <div style={{
      borderRadius:'4px',
      borderWidth:'1px',
      borderColor:'#E0E0E0',
      padding: '16px',
      marginTop:'40px 0px'
    }}
    >
    <div style={{
      color:'#5A32F3',
      fontWeight:'bold',
      fontFamily:'Inter',
      fontSize:'24px',
      lineHeight:'29px'
    }}>Fraktal NFT Buyout</div>
    <HStack style={{marginTop:'24px'}}>
      <VStack style={{
        textAlign:'start',
        marginLeft:'24px'
      }}>
      <div style={{
        fontFamily:'Inter',
        fontWeight:600,
        fontSize:'12px',
        lineHeight:'14px',
        letterSpacing:'1px',
        color:'#A7A7A7'
      }}>
      MIN OFFER
      </div>
      <HStack>
        <img src={"/eth.png"} alt={'Eth'} style={{height:'26px', marginRight:'4px'}}/>
        <div style={{
          fontFamily:'Inter',
          fontWeight:600,
          fontSize:'32px',
          lineHeight:'40px',
          color:'#000000'
        }}>
          {minPrice ?minPrice:0}
        </div>
      </HStack>
      </VStack>
      <VStack style={{
        textAlign:'start'
      }}>
        <div style={{
          fontFamily:'Inter',
          fontWeight:600,
          fontSize:'12px',
          lineHeight:'14px',
          letterSpacing:'1px',
          color:'#A7A7A7'
        }}>
          INVESTORS
        </div>
        <div style={{
          fontFamily:'Inter',
          fontWeight:600,
          fontSize:'32px',
          lineHeight:'40px',
          color:'#000000'
        }}>
          {investors}
        </div>
      </VStack>
      <VStack style={{
        textAlign:'start',
        marginLeft:'24px'
      }}>
        <div style={{
          fontFamily:'Inter',
          fontWeight:600,
          fontSize:'12px',
          lineHeight:'14px',
          letterSpacing:'1px',
          color:'#A7A7A7'
        }}>
          BUYOUT OFFER IN ETH
        </div>
        <FrakButton2
          isReady={isReady}
          onClick={onOffer}
          onSet={onSetValue}
        >
          {offering ? "Making offer" : "Offer"}
        </FrakButton2>
      </VStack>
    </HStack>
    <div style={{
      fontWeight:300,
      fontSize:'12px',
      lineHeight:'14px',
      marginTop:'24px',
      marginBottom:'32px'
    }}>
    x% (majority) of the investors have to accept your offer for it to go through.
    </div>

    <Divider />
    <div style={{
      fontSize:'20px',
      lineHeight:'24px',
      fontWeight:300,
      marginTop:'12px'
    }}>
      Offers
    </div>
    {offers && offers.length ?
      <Table>
      {/* all this should have its own component.. to get the functions*/}
        <Thead>
          <Tr>
            <Td>DATE</Td>
            <Td>ADDRESS</Td>
            <Td>OFFER</Td>
            <Td>ACTION</Td>
          </Tr>
        </Thead>

        <Tbody>
          {offers.map(x=>{
              return(
                <OfferDetail
                  account = {account}
                  offerItem = {x}
                  tokenAddress = {tokenAddress}
                  marketAddress = {marketAddress}
                  provider = {provider}
                />
              )
          })}
        </Tbody>
      </Table>
      :
      <div style={{marginTop:'24px'}}>
      There are no offers for this NFT.
      </div>
    }
    </div>

  )

})
export default BuyOutCard;
