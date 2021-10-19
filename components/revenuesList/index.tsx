import { Box, Center, StackProps, Text, VStack, HStack } from "@chakra-ui/layout";
import React, { forwardRef, useState, useEffect } from "react";
import RevenuesDetail from '../revenuesDetail';
import { utils } from "ethers";

// if account has fraktions.. display info to list?

const RevenuesList=(({account, revenuesCreated, tokenAddress, marketAddress, provider}) => {

  // add component to deposit revenues
  // and in details, claim
  // const totalValue = (x) => utils.parseEther((x).toString());


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
    }}>Revenues</div>
      <div>
        Add revenue
      </div>
      <div>
        {revenuesCreated && revenuesCreated.length ?
          <div>
            <HStack>
              <div>Creator</div>
              <div>Date</div>
              <div>Reason</div>
              <div>Total</div>
              <div>Functions</div>
            </HStack>
            {revenuesCreated.map(x=>{
              return(
                <RevenuesDetail
                  account = {account}
                  revenueAddress={x.id}
                  date={x.timestamp}
                  value={x.value}
                  creator={x.creator.id}
                  buyout = {x.buyout}
                  provider={provider}
                  tokenAddress={x.tokenAddress}
                />
              )
            })}
          </div>
          :
          <div style={{marginTop:'24px'}}>
            There are no revenues on this NFT.
          </div>
        }
      </div>
    </div>

  )

})
export default RevenuesList;
