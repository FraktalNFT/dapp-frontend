/**
 * React
 */
import React, {useEffect, useState} from 'react';
/**
 * Next
 */
import {useRouter} from "next/router";
/**
 * Chakra
 */
import { VStack, HStack, Text } from '@chakra-ui/layout';
/**
 * Frakal Components
 */
import FrakButton from '@/components/button';
/**
 * Contracts Calls
 */
import {
  importFraktal,
  approveMarket,
  claimERC721,
  claimERC1155,
  exportFraktal,
  getIndexUsed, getFraktionsIndex,
} from '@/utils/contractCalls';
/**
 * Workflow
 */
import { Workflow } from 'types/workflow';
import { useLoadingScreenHandler } from 'hooks/useLoadingScreen';
/**
 * Constants
 */
import {MAX_FRAKTIONS} from "@/utils/constants";

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
  const { closeLoadingModalAfterDelay } = useLoadingScreenHandler();

  const router = useRouter();
  const [isDefraking, setDefraking] = useState<boolean>(false);
  const [isClaiming, setClaiming] = useState<boolean>(false);

  async function claimNFT() {
    setClaiming(true);
    const actionOpts = { workflow: Workflow.CLAIM_NFT };
    if (!factoryApproved) {
      const result = await approveMarket(factoryAddress, provider, tokenAddress, actionOpts);
      if (result.error) {
        setClaiming(false);
      }
    }
    if (collateral.type == 'ERC721') {
      await claimERC721(marketId, provider, factoryAddress, actionOpts);
    } else {
      await claimERC1155(marketId, provider, factoryAddress, actionOpts);
    }
    closeLoadingModalAfterDelay();
    setClaiming(false);
    setTimeout(() => {
      router.reload();
    }, 2500);
  }

  async function defraktionalization() {
    setDefraking(true);
    let tx;
    if (tx || isApproved) {
      try {
        await exportFraktal(tokenAddress, provider, marketAddress);
      } catch (e) {
        setDefraking(false);
      }
      
      if (collateral) {
        await claimNFT();
        setDefraking(false);
      } else {
        closeLoadingModalAfterDelay();
        setTimeout(() => {
          router.reload()
        }, 2500);
      }
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
    closeLoadingModalAfterDelay();
    setTimeout(() => {
      router.reload()
    }, 2500);
  }

  useEffect(() => {
    async function checkImportedFraktal() {
      if (window.location.search.includes('?frak=1')) {
        const fraktionIndex = await getFraktionsIndex(provider, tokenAddress);
        if (fraktionIndex === 0) {
          importFraktalToMarket();
        }
      }
    }
    checkImportedFraktal();
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

          {fraktions == MAX_FRAKTIONS ? (
            <HStack>
              <FrakButton disabled={isDefraking || isClaiming} onClick={() => defraktionalization()}>
                DeFrak
              </FrakButton>
            </HStack>
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
        <VStack>
          <Text>You own this NFT</Text>
            <HStack>
            {collateral && collateral.id && (
              <FrakButton onClick={() => claimNFT()}>Claim NFT</FrakButton>
            )}
            <FrakButton onClick={() => importFraktalToMarket()}>FRAK IT</FrakButton>
          </HStack>
        </VStack>
      )}
    </div>
  );
};

export default UserOwnership
