import { Box, Center, StackProps, Text, VStack, HStack } from "@chakra-ui/layout";
import React, { forwardRef, useState, useEffect } from "react";
import FraktionsDetail from '../fraktionsDetail';
import { utils } from "ethers";

const UserOwnership=(({fraktions}) => {

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
    }}>Your Ownership</div>
    <HStack justifyContent='space-between' marginTop='10px'>
      <VStack>
        <div style={{
          fontFamily:'Inter',
          fontWeight:600,
          fontSize:'12px',
          lineHeight:'14px',
          letterSpacing:'1px',
          color:'#A7A7A7'
        }}>
          PERCENTEAGE
        </div>
        <div style={{
          fontFamily:'Inter',
          fontWeight:600,
          fontSize:'32px',
          lineHeight:'40px',
          color:'#000000'
        }}>
          {fraktions/100}%
        </div>
      </VStack>
      <VStack>
        <div style={{
          fontFamily:'Inter',
          fontWeight:600,
          fontSize:'12px',
          lineHeight:'14px',
          letterSpacing:'1px',
          color:'#A7A7A7'
        }}>
          FRAKTIONS
        </div>
        <div style={{
          fontFamily:'Inter',
          fontWeight:600,
          fontSize:'32px',
          lineHeight:'40px',
          color:'#000000'
        }}>
          {fraktions}
        </div>
      </VStack>
    </HStack>
    <div style={{
      marginTop:'10px',
      fontFamily:'Inter',
      fontWeight:'normal',
      fontSize:'12px',
      lineHeight:'14px',
      letterSpacing:'1px',
      color:'#656464'
    }}>
      You can redeem the NFT if you own 100% of the Fraktions
    </div>

    </div>

  )

})
export default UserOwnership;
