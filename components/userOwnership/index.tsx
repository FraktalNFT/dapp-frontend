import {  VStack, HStack } from "@chakra-ui/layout";
import React from "react";
import FrakButton from '../button';
import {
  importFraktal,
  approveMarket,
  claimERC721,
  claimERC1155,
  defraktionalize
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
    if(!isApproved){
      tx = await approveMarket(marketAddress, provider, tokenAddress)
    }
    if(tx || isApproved){
      await defraktionalize(provider, tokenAddress)
      // defraktionalize leaves the nft in the market!!!
      // can claim (etherscan) ANYONE!
    }
  }


  async function importFraktalToMarket(){
    if(!isApproved){
      await approveMarket(marketAddress, provider, tokenAddress);
    }
    let index = 1;
    // check indexes in a while loop for indexUsed..
    await importFraktal(tokenAddress,index,provider,marketAddress);
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
    }}>Your Ownership</div>
    {!isFraktalOwner ?
      <div>
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
