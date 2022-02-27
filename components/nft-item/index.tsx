import { useState, useEffect } from "react";
import { useRouter } from "next/router"
import NextLink from "next/link";
import { Image } from "@chakra-ui/image";
import {
  Box,
  StackProps,
  Text,
  VStack,
  BoxProps,
  Spinner,
  Tag,
  TagLabel,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button // @todo: Use a tiny badge with three dots icon
} from "@chakra-ui/react";
import React, { forwardRef } from "react";
import {
  Flex,
  Spacer,
  forwardRef as fRef,
  HTMLChakraProps,
  chakra,
} from "@chakra-ui/react";
import { FrakCard } from "../../types";
import { motion, isValidMotionProp, HTMLMotionProps } from "framer-motion";
import FrakButton from "../../components/button";
import { useUserContext } from "@/contexts/userContext";
import { BigNumber, utils } from "ethers";
import { useWeb3Context } from "../../contexts/Web3Context";
import { getListingAmount, unlistItem } from "../../utils/contractCalls"
import toast from "react-hot-toast";
import { roundUp } from "../../utils/math";
import { resolveTransferNFTRoute } from "@/constants/routes";

interface NFTItemProps extends StackProps {
  id: string;
  item: FrakCard;
  name: String;
  amount: String;
  price: Number;
  imageURL: String;
  CTAText?: string;
  wait?: number;
  height?: string;
  isMyNFT: boolean;
}

const NFTItem = forwardRef<HTMLDivElement, NFTItemProps>(
  ({ id, item, amount, price, imageURL, name, onClick, CTAText, isMyNFT, wait, height = '35rem' }, ref) => {

    /// let risk a route
    const router = useRouter();
    const [isVisible, setIsVisible] = useState(false);
    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const [isListed, setIsListed] = useState(false);
    const { fraktions, fraktals } = useUserContext();
    const { account, provider, marketAddress } = useWeb3Context();

    const canFrak = item && !!(fraktals || []).find(fraktion => fraktion.id === item.id);
    const canList = item && !!(fraktions || []).find(fraktion => fraktion.id === item.id);

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
    }, [])

    const priceParsed = price => {
      return (roundUp(price, 3));
    }

    const unList = async () => {
      toast("Unlisting...")
      await unlistItem(item.id, provider, marketAddress).then(
        () => {
          toast.success("Fraktion Unlisted");
          setIsListed(!isListed);
        }
      )
    }

    let showAmount = "";
    if (amount != undefined) {
      const BIamount = utils.parseUnits(String(amount), "wei");
      if (BIamount.lt(utils.parseEther("1.0"))) {
        showAmount = "<0.01";
      } else {
        showAmount = utils.formatEther(BIamount.div(100));
      }
    }

    const onImageLoad = (ms: number) => {
      setTimeout(() => {
        setIsImageLoaded(true);
      }, ms);
    };

    setTimeout(() => {
      setIsVisible(true);
    }, wait * Math.random());

    const visibleStyle = { opacity: `1` };
    const inVisibleStyle = { opacity: `0` };
    const inVisibleAnimStyle = {
      animationName: `loadingCard`,
      animationDuration: `1s`,
      "animation-iteration-count": `infinite`,
    };

    const NFTOptionsMenu = () => {
      const [isOpen, setisOpen] = useState<boolean>(true)
      return (
        <Menu>
          {({ isOpen }) => (
            <>
              <MenuButton isActive={isOpen} as={Button}>
                {isOpen ? 'Transfer' : 'Transfer'}
              </MenuButton>
              <MenuList>
                <MenuItem onClick={() => router.push(resolveTransferNFTRoute(id))}>Transfer</MenuItem>
              </MenuList>
            </>
          )}
        </Menu>
      )
    }

    return (
      <>
        {isVisible && (
          <Box

            rounded="md"
            borderWidth="1px"
            boxShadow="md"
            onClick={onClick}
            _hover={{
              boxShadow: "xl",
            }}
            ref={ref}
            sx={isImageLoaded ? null : inVisibleAnimStyle}
          >
            <VStack cursor="pointer">
              <Box
                h={isImageLoaded ? height : "0px"}
                w="100%"
                position="relative"
                sx={
                  isImageLoaded
                    ? visibleStyle
                    : inVisibleStyle /* toggle visibility */
                }
              >
               {item && (
                  <NextLink key={item.id} href={`/nft/${item.id}/details`}>
                  <Image
                    src={'https://image.fraktal.io/?height=350&image=' + imageURL}
                    width="100%"
                    height="100%"
                    objectFit="cover"
                    margin-left="auto"
                    margin-right="auto"
                    display="flex"
                    sx={{
                      objectFit: `cover`,
                    }}
                    style={{ verticalAlign: "middle" }}
                    onLoad={() => onImageLoad(5)}
                  />
                </NextLink>
               )}
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
                      display: "grid",
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
              <Flex alignItems="center" justifyContent="space-between" mb="1rem">
                <Text className="semi-16">
                  {name}
                </Text>
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
              {isMyNFT && (
                <NFTOptionsMenu />
              )}
              {canFrak && (
                <Box textAlign="center" marginTop={5}>
                  <NextLink href={`nft/${item.id}/details?frak=1`}>
                    <FrakButton size="sm">Frak it</FrakButton>
                  </NextLink>
                </Box>
              )}

              {canList && isListed && (
                <Box textAlign="center" marginTop={5}>
                  <NextLink href={"my-nfts"} scroll={false}>
                    <FrakButton size="sm" onClick={unList}
                    >Unlist Fraktions</FrakButton>
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

export default NFTItem;
