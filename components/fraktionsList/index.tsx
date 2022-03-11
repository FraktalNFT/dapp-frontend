import React from "react";
import FraktionsDetail from '../fraktionsDetail';
import FrakButton from '../../components/button4'
import {
  Icon,
  Tooltip
} from '@chakra-ui/react';
import { AiOutlineInfoCircle } from 'react-icons/ai';

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
      lineHeight:'29px',
      display: "flex",
      justifyContent: "space-between"
    }}>
      Fraktions
      <div>
      <FrakButton
        onClick={() =>
          console.log('Button click')
        }
      >
        Verify On Opensea
      </FrakButton>
      <Tooltip
        border=" 1px solid #00C49D"
        borderRadius="4px"
        boxShadow="none"
        padding="8px"
        fontSize="14px"
        bg="#fff"
        color="#656464"
        placement="top"
        label="Make sure to check that the NFT you are buying Fraktions of is authentic."
        offset={[0, 20]}
      >
        <span style={{ cursor: 'pointer', paddingLeft: 4 }}>
          <Icon as={AiOutlineInfoCircle} w={10} h={10} color="#00C49D" />
        </span>
      </Tooltip>
      </div>
      
    </div>
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
