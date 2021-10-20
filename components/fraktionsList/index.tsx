import { Box, Center, StackProps, Text, VStack, HStack } from "@chakra-ui/layout";
import React, { forwardRef, useState, useEffect } from "react";
import FraktionsDetail from '../fraktionsDetail';
import { utils } from "ethers";

// if account has fraktions.. display info to list?

const FraktionsList=(({fraktionsListed, tokenAddress, marketAddress, provider}) => {


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
    }}>Fraktions</div>
      {fraktionsListed && fraktionsListed.length ?
        <div>
          {fraktionsListed.map(x=>{
            return(
              <FraktionsDetail
                key={x.id}
                amount={x.amount}
                price={x.price}
                seller={x.seller.id}
                tokenAddress={tokenAddress}
                marketAddress={marketAddress}
                provider={provider}
              />
            )
          })}
        </div>
        :
        <div style={{marginTop:'24px'}}>
          There are no listed Fraktions of this NFT.
        </div>
      }
    </div>

  )

})
export default FraktionsList;
