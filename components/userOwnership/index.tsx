import {  VStack, HStack } from "@chakra-ui/layout";
import React, { useEffect } from "react";
import FrakButton from '../button';
import {
  importFraktal,
  approveMarket,
  claimERC721,
  claimERC1155,
  exportFraktal,
  getIndexUsed
} from '../../utils/contractCalls';

const UserOwnership=(({
  fraktions,
  isFraktalOwner,
  collateral,
  isApproved,
  marketAddress,
  tokenAddress,
  factoryAddress,
  provider,
  marketId,
  factoryApproved
}) => {
  async function claimNFT(){
    // this requires the factory to be approved
    if(!factoryApproved){
      await approveMarket(factoryAddress, provider, tokenAddress);
    }
    if(collateral.type == 'ERC721'){
      // i dont have market Id!!
      await claimERC721(marketId, provider, factoryAddress)
    }else{
      await claimERC1155(marketId, provider, factoryAddress)
    }
  }

  async function defraktionalization() {
    let tx;
    // if(!isApproved){
    //   tx = await approveMarket(marketAddress, provider, tokenAddress)
    // }
    if(tx || isApproved){
      console.log('export')
      await exportFraktal(tokenAddress, provider, marketAddress)
      // defraktionalize leaves the nft in the market!!!
      // can claim (etherscan) ANYONE!
    }
  }



  async function importFraktalToMarket(){
    if(!isApproved){
      await approveMarket(marketAddress, provider, tokenAddress);
    }
    let index = 0;
    let isUsed = true;
    while(isUsed == true){
      index += 1;
      isUsed = await getIndexUsed(index, provider, tokenAddress);
      // console.log('testint index = ',index,' and is Used: ',isUsed)
    }
    if(isUsed == false){
      await importFraktal(tokenAddress,index,provider,marketAddress);
    }
  }

  useEffect(() => {
    if (window.location.search.includes('?frak=1')) {
      importFraktalToMarket();
    }
  }, []);

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
    {!isFraktalOwner ?
      <div>
        <HStack sx={{width: `100%`}} justifyContent='space-between' marginTop='10px'>
          <VStack>
            <div style={{
              fontFamily:'Inter',
              fontWeight:600,
              fontSize:'12px',
              lineHeight:'14px',
              letterSpacing:'1px',
              color:'#A7A7A7'
            }}>
              PERCENTAGE
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

        {fraktions == 10000 ?
          <FrakButton
            onClick={() => defraktionalization()}
          >
          DeFrak
          </FrakButton>
          :
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
        }
      </div>
      :
      <div>
        You own this Fraktal
        {collateral && collateral.id &&
          <FrakButton
            onClick={()=>claimNFT()}
          >
            Claim Collateral
          </FrakButton>
        }
        <br/>
        <FrakButton
        onClick={()=>importFraktalToMarket()}
        >
          Fraktionalize it
        </FrakButton>
      </div>
    }
    </div>
  )
})
export default UserOwnership;
