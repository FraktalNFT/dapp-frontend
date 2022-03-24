import React, { forwardRef, useState, useEffect } from 'react';
/**
 * Chakra UI
 */
import { Image } from '@chakra-ui/image';
import {
  Box,
  StackProps,
  Text,
  VStack,
  BoxProps,
  Spinner,
  Tag,
  TagLabel,
} from '@chakra-ui/react';

import {
  Flex,
  Spacer,
  forwardRef as fRef,
  HTMLChakraProps,
  chakra,
} from '@chakra-ui/react';
/**
 * Next
 */
import { useRouter } from "next/router";
import NextLink from 'next/link';
/***
 * Component
 */
import FrakButton from '@/components/button';
/**
 * Context
 */
import { useUserContext } from '@/contexts/userContext';
import { useWeb3Context } from '@/contexts/Web3Context';
import { BigNumber, utils } from 'ethers';
/**
 * Contracts
 */
import {getListingAmount, unlistItem, claimERC721, claimERC1155, approveMarket,getApproved} from '@/utils/contractCalls';
import toast from 'react-hot-toast';
import { roundUp } from '@/utils/math';
import {Workflow} from "@/types/workflow";
import { useLoadingScreenHandler } from 'hooks/useLoadingScreen';
import store from "@/redux/store";
import {MY_NFTS} from "@/constants/routes";
import NFTMedia from "@/components/media";

/**
 * Types
 */

import { FrakCard } from '../../types';

/**
 * NFTItem
 */
const NFTItem = forwardRef<HTMLDivElement, NFTItemProps>(
  (
    {
      item,
      amount,
      price,
      imageURL,
      name,
      onClick,
      CTAText,
      wait,
      height = '35rem',
    },
    ref
  ) => {
    const router = useRouter();
    const [isVisible, setIsVisible] = useState(false);
    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const [isListed, setIsListed] = useState(false);
    const [isUnlisting, setIsUnlisting] = useState(false);
    const [isClaiming, setIsClaiming] = useState(false);
    const { fraktions, fraktals } = useUserContext();
    const { account, provider, marketAddress, factoryAddress } = useWeb3Context();
    const { closeLoadingModalAfterDelay } = useLoadingScreenHandler()

    const canFrak =
      item && !!(fraktals || []).find((fraktion) => fraktion.id === item.id);

    const canList =
      item && !!(fraktions || []).find((fraktion) => fraktion.id === item.id);

    useEffect(() => {
      if (item) {
        getListingAmount(account, item.id, provider, marketAddress).then(
          (amount: BigNumber) => {
            if (amount.gt(0)) {
              setIsListed(true);
            } else {
              setIsListed(false);
            }
          }
        );
      }
    }, []);

    const priceParsed = (price) => {
      return roundUp(price, 3);
    };

    const unList = async () => {
      toast('Unlisting...');
      setIsUnlisting(true);
      await unlistItem(item.id, provider, marketAddress).then(() => {
        closeLoadingModalAfterDelay()
        toast.success('Fraktion Unlisted');
        setIsListed(!isListed);
      }).finally(() => {
        setIsUnlisting(false);
      });
    };

    let showAmount = '';
    if (amount != undefined) {
      const BIamount = utils.parseUnits(String(amount), 'wei');
      if (BIamount.lt(utils.parseEther('1.0'))) {
        showAmount = '<0.01';
      } else {
        showAmount = utils.formatEther(BIamount.div(100));
      }
    } else {
      showAmount = '';
    }

    setTimeout(() => {
      setIsVisible(true);
    }, wait * Math.random());

    const visibleStyle = { opacity: `1` };
    const inVisibleStyle = { opacity: `0` };
    const inVisibleAnimStyle = {
      animationName: `loadingCard`,
      animationDuration: `1s`,
      'animation-iteration-count': `infinite`,
    };

    const withdrawNFT = async (item, event) => {
        event.stopPropagation();
        setIsClaiming(true);
        const actionOpts = { workflow: Workflow.CLAIM_NFT };
        try {
          const isApproved = await getApproved(account,factoryAddress,provider,item.id);
          let receipt;
          if(!isApproved){
            receipt = await approveMarket(factoryAddress, provider, item.id, actionOpts);
          }
          
          if (isApproved || !receipt?.error) {
            if (item.collateral.type == 'ERC721') {
              await claimERC721(item.marketId, provider, factoryAddress, actionOpts).then((response) => {
                closeLoadingModalAfterDelay();
                setTimeout(() => {
                  router.reload()
                }, 2500);
              }).finally(() => {
                setIsClaiming(false);
              });
            } else {
              await claimERC1155(item.marketId, provider, factoryAddress, actionOpts).then((response) => {
                closeLoadingModalAfterDelay();
                setTimeout(() => {
                  router.reload()
                }, 2500);
              }).finally(() => {
                setIsClaiming(false);
              });
            }
          }
        } catch (e) {
          console.log(e)
          setIsClaiming(false);
        }


    };

    return (
      <>
        {isVisible && (
          <Box
            rounded="md"
            borderWidth="1px"
            boxShadow="md"
            onClick={onClick}
            _hover={{
              boxShadow: 'xl',
            }}
            ref={ref}
            sx={isImageLoaded ? null : inVisibleAnimStyle}
          >
            <VStack cursor="pointer">
              <Box
                h={isImageLoaded ? height : '0px'}
                w="100%"
                position="relative"
                sx={
                  isImageLoaded
                    ? visibleStyle
                    : inVisibleStyle /* toggle visibility */
                }
              >
                {imageURL && <NFTMedia
                    type={'fit'}
                    imageURL={imageURL}
                    setIsImageLoaded={setIsImageLoaded}/>
                }
              </Box>
              {!isImageLoaded && (
                <Box
                  h="35rem"
                  w="100%"
                  position="relative"
                  sx={
                    !isImageLoaded /* inverse of image visibility */
                      ? visibleStyle
                      : inVisibleStyle /* toggle visibility */
                  }
                >
                  <Box
                    sx={{
                      display: 'grid',
                      width: `100%`,
                      height: `100%`,
                      placeItems: `center`,
                    }}
                  >
                    <Spinner size="xl" />
                  </Box>
                </Box>
              )}
            </VStack>
            <Box margin="1rem">
              <Flex
                alignItems="center"
                justifyContent="space-between"
                mb="1rem"
              >
                <Text className="semi-16">{name}</Text>
                <Tag size="lg">
                  <TagLabel fontSize="xl">Fixed Price</TagLabel>
                </Tag>
              </Flex>
              <Flex>
                {amount && (
                  <Text className="medium-12">{showAmount}% Available</Text>
                )}

                <Spacer />
                <Image
                  align="vertical"
                  width="5"
                  height="8"
                  marginEnd="3px"
                  src="eth.svg"
                />
                {price && (
                  <Text textAlign="end" className="medium-12">
                    {priceParsed(price)}
                    {/* {Math.round(price * 100000) / 100000} */}
                  </Text>
                )}
              </Flex>

              {canFrak && (
                <Box textAlign="center" marginTop={5}>
                  <NextLink href={`nft/${item.id}/details?frak=1`}>
                    <FrakButton size="sm">Frak it</FrakButton>
                  </NextLink>
                  {item.collateral && (
                      <FrakButton marginLeft="10px"
                                  size="sm"
                                  disabled={isClaiming}
                        onClick={(e) => withdrawNFT(item, e)}
                      >Withdraw NFT</FrakButton>
                  )}
                </Box>
              )}

              {canList && isListed && (
                <Box textAlign="center" marginTop={5}>
                  <NextLink href={'my-nfts'} scroll={false}>
                    <FrakButton disabled={isUnlisting} size="sm" onClick={unList}>
                      Unlist Fraktions
                    </FrakButton>
                  </NextLink>
                </Box>
              )}
              {canList && !isListed && (
                <Box textAlign="center" marginTop={5}>
                  <NextLink href={`nft/${item.marketId}/list-item`}>
                    <FrakButton size="sm">Sell Fraktions</FrakButton>
                  </NextLink>
                </Box>
              )}
            </Box>
          </Box>
        )}
      </>
    );
  }
);

interface NFTItemProps extends StackProps {
  item: FrakCard;
  name: string;
  amount: string;
  price: number;
  imageURL: string;
  CTAText?: string;
  wait?: number;
  height?: string;
}

export default NFTItem;
