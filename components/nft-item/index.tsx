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
import {getListingAmount, unlistItem, claimERC721, claimERC1155, approveMarket} from '@/utils/contractCalls';
import toast from 'react-hot-toast';
import { roundUp } from '@/utils/math';
import {Workflow} from "@/types/workflow";
import { useLoadingScreenHandler } from 'hooks/useLoadingScreen';
import store from "@/redux/store";
import {MY_NFTS} from "@/constants/routes";
import NFTMedia from "@/components/media";
import {useWalletContext} from "@/contexts/WalletAssets";

import { FrakCard } from '../../types';

/**
 * Types
 */
interface NFTItemProps extends StackProps {
  item: FrakCard;
  name: string;
  amount: string;
  price: number;
  imageURL: string;
  CTAText?: string;
  wait?: number;
  height?: string;
  canFrak?: any;
  canList?: any;
}

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
      canFrak = () => {},
      canList = () => {},
    },
    ref
  ) => {
    const router = useRouter();
    const [isVisible, setIsVisible] = useState(false);
    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const [isListed, setIsListed] = useState(false);
    const { account, provider, marketAddress, factoryAddress } = useWeb3Context();
    const { closeLoadingModalAfterDelay } = useLoadingScreenHandler()

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
      await unlistItem(item.id, provider, marketAddress).then(() => {
        closeLoadingModalAfterDelay()
        toast.success('Fraktion Unlisted');
        setIsListed(!isListed);
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
        const actionOpts = { workflow: Workflow.CLAIM_NFT };
        const receipt = await approveMarket(factoryAddress, provider, item.id, actionOpts);
     //   console.log('receipt', receipt)
        if (!receipt?.error) {
     //     console.log('item.collateral', receipt)
          if (item.collateral.type == 'ERC721') {
            await claimERC721(item.marketId, provider, factoryAddress, actionOpts).then((response) => {
              closeLoadingModalAfterDelay();
              setTimeout(() => {
                router.reload()
              }, 2500);
            });
          } else {
            await claimERC1155(item.marketId, provider, factoryAddress, actionOpts).then((response) => {
              closeLoadingModalAfterDelay();
              setTimeout(() => {
                router.reload()
              }, 2500);
            });
          }
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

              {canFrak(item) && (
                <Box textAlign="center" marginTop={5}>
                  <NextLink href={`nft/${item.id}/details?frak=1`}>
                    <FrakButton size="sm">Frak it</FrakButton>
                  </NextLink>
                  {item.collateral && (<FrakButton marginLeft="10px" size="sm" onClick={(e) => withdrawNFT(item, e)} >Withdraw NFT</FrakButton>)}
                </Box>
              )}

              {canList(item) && isListed && (
                <Box textAlign="center" marginTop={5}>
                  <NextLink href={'my-nfts'} scroll={false}>
                    <FrakButton size="sm" onClick={unList}>
                      Unlist Fraktions
                    </FrakButton>
                  </NextLink>
                </Box>
              )}
              {canList(item) && !isListed && (
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


export default NFTItem;
