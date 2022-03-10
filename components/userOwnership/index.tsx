import { VStack, HStack } from '@chakra-ui/layout';
import React, { useEffect } from 'react';
import FrakButton from '../button';
import {
  importFraktal,
  approveMarket,
  claimERC721,
  claimERC1155,
  exportFraktal,
  getIndexUsed,
} from '../../utils/contractCalls';

import { Workflow } from 'types/workflow';
import { connect } from 'react-redux';
import { useLoadingScreenHandler } from 'hooks/useLoadingScreen';

const UserOwnership = ({
  fraktions,
  isFraktalOwner,
  collateral,
  isApproved,
  marketAddress,
  tokenAddress,
  factoryAddress,
  provider,
  marketId,
  factoryApproved,
}) => {
  const { closeLoadingModalAfterDelay } = useLoadingScreenHandler()
  async function claimNFT() {
    const actionOpts = { workflow: Workflow.CLAIM_NFT };
    // this requires the factory to be approved
    if (!factoryApproved) {
      await approveMarket(factoryAddress, provider, tokenAddress, actionOpts);
    }
    if (collateral.type == 'ERC721') {
      // i dont have market Id!!
      await claimERC721(marketId, provider, factoryAddress, actionOpts);
    } else {
      await claimERC1155(marketId, provider, factoryAddress, actionOpts);
    }
  }

  async function defraktionalization() {
    let tx;
    // if(!isApproved){
    //   tx = await approveMarket(marketAddress, provider, tokenAddress)
    // }
    if (tx || isApproved) {
      await exportFraktal(tokenAddress, provider, marketAddress);
      closeLoadingModalAfterDelay()
      // defraktionalize leaves the nft in the market!!!
      // can claim (etherscan) ANYONE!
    }
  }

  async function importFraktalToMarket() {
    const actionOpts = { workflow: Workflow.FRAK_NFT };
    if (!isApproved) {
      await approveMarket(marketAddress, provider, tokenAddress, actionOpts);
    }
    let index = 0;
    let isUsed = true;
    while (isUsed == true) {
      index += 1;
      isUsed = await getIndexUsed(index, provider, tokenAddress);
      // console.log('testint index = ',index,' and is Used: ',isUsed)
    }
    if (isUsed == false) {
      await importFraktal(
        tokenAddress,
        index,
        provider,
        marketAddress,
        actionOpts
      );
    }
    closeLoadingModalAfterDelay()
  }

  useEffect(() => {
    if (window.location.search.includes('?frak=1')) {
      importFraktalToMarket();
    }
  }, []);

  return (
    <div
      style={{
        borderRadius: '4px',
        borderWidth: '1px',
        borderColor: '#E0E0E0',
        padding: '16px',
        marginTop: '40px 0px',
      }}
    >
      <div
        style={{
          color: '#5A32F3',
          fontWeight: 'bold',
          fontFamily: 'Inter',
          fontSize: '24px',
          lineHeight: '29px',
        }}
      >
        Your Ownership
      </div>
      {!isFraktalOwner ? (
        <div>
          <HStack
            sx={{ width: `100%` }}
            justifyContent="space-between"
            marginTop="10px"
          >
            <VStack>
              <div
                style={{
                  fontFamily: 'Inter',
                  fontWeight: 600,
                  fontSize: '12px',
                  lineHeight: '14px',
                  letterSpacing: '1px',
                  color: '#A7A7A7',
                }}
              >
                PERCENTAGE
              </div>
              <div
                style={{
                  fontFamily: 'Inter',
                  fontWeight: 600,
                  fontSize: '32px',
                  lineHeight: '40px',
                  color: '#000000',
                }}
              >
                {fraktions / 100}%
              </div>
            </VStack>
            <VStack>
              <div
                style={{
                  fontFamily: 'Inter',
                  fontWeight: 600,
                  fontSize: '12px',
                  lineHeight: '14px',
                  letterSpacing: '1px',
                  color: '#A7A7A7',
                }}
              >
                FRAKTIONS
              </div>
              <div
                style={{
                  fontFamily: 'Inter',
                  fontWeight: 600,
                  fontSize: '32px',
                  lineHeight: '40px',
                  color: '#000000',
                }}
              >
                {fraktions}
              </div>
            </VStack>
          </HStack>

          {fraktions == 10000 ? (
            <FrakButton onClick={() => defraktionalization()}>
              DeFrak
            </FrakButton>
          ) : (
            <div
              style={{
                marginTop: '10px',
                fontFamily: 'Inter',
                fontWeight: 'normal',
                fontSize: '12px',
                lineHeight: '14px',
                letterSpacing: '1px',
                color: '#656464',
              }}
            >
              You can redeem the NFT if you own 100% of the Fraktions
            </div>
          )}
        </div>
      ) : (
        <div>
          You own this NFT
          {collateral && collateral.id && (
            <FrakButton onClick={() => claimNFT()}>Claim NFT</FrakButton>
          )}
          <br />
          <FrakButton onClick={() => importFraktalToMarket()}>
            FRAK IT
          </FrakButton>
        </div>
      )}
    </div>
  );
};

export default UserOwnership
