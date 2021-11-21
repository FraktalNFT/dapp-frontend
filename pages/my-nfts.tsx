import {
  Box,
  Center,
  Flex,
  Grid,
  Link,
  Spacer,
  Text,
  VStack,
} from "@chakra-ui/layout";
import { Image } from "@chakra-ui/react";
import Head from "next/head";
import React from "react";
import NFTItemOS from "../components/nft-item-opensea";
import NFTItem from "../components/nft-item";
import RescueCard from "../components/rescueCard";
import NextLink from "next/link";
import styles from "../styles/my-nfts.module.css";
import FrakButton from "../components/button";
import { useWeb3Context } from "../contexts/Web3Context";
import { useUserContext } from "../contexts/userContext";
import { useMintingContext } from "@/contexts/NFTIsMintingContext";
import {
  importFraktal,
  approveMarket,
  importERC721,
  importERC1155,
  getApproved,
} from "../utils/contractCalls";
import { useRouter } from "next/router";

export default function MyNFTsView() {
  const router = useRouter();
  const { account, provider, factoryAddress, marketAddress } = useWeb3Context();
  const { fraktals, fraktions, nfts, balance } = useUserContext();

  const { isMinting } = useMintingContext();

  async function approveContract(contract, tokenAddress) {
    let done = await approveMarket(contract, provider, tokenAddress);
    return done;
  }

  async function importNFT(item) {
    let res;
    let done;
    let approved = await getApproved(
      account,
      factoryAddress,
      provider,
      item.id
    );
    // console.log('is approved?',approved)
    if (!approved) {
      done = await approveContract(factoryAddress, item.id);
    } else {
      done = true;
    }
    // overflow problem with opensea assets.. subid toooo big
    if (done) {
      if (item.token_schema == "ERC721") {
        res = await importERC721(
          parseInt(item.tokenId),
          item.id,
          provider,
          factoryAddress
        );
      } else {
        res = await importERC1155(
          parseInt(item.tokenId),
          item.id,
          provider,
          factoryAddress
        );
      }
    }
    if (done && res) {
      router.reload();
    }
  }
  async function importFraktalToMarket(item) {
    let res;
    let done;
    let approved = await getApproved(account, marketAddress, provider, item.id);
    // console.log('is approved?',approved)
    if (!approved) {
      done = await approveContract(marketAddress, item.id);
    } else {
      done = true;
    }
    // overflow problem with opensea assets.. subid toooo big
    if (done) {
      res = await importFraktal(item.id, 1, provider, marketAddress); // change 1 to fraktionsIndex.. should be changeable
    }
    if (done && res) {
      router.reload();
    }
  }

  return (
    <VStack width="96.4rem">
      <Head>
        <title>Fraktal - My NFTs</title>
      </Head>

      <Flex w="100%">
        <Box className={styles.header}>Your NFTs</Box>
        <Spacer />
        <Box>
          <NextLink href={`/list-nft`}>
            <FrakButton style={{ width: "160px", marginTop: "6px" }}>
              Add NFT
            </FrakButton>
          </NextLink>
        </Box>
      </Flex>

      {fraktals?.length ? (
        <Grid
          mt="40px !important"
          ml="0"
          mr="0"
          mb="5.6rem !important"
          w="100%"
          templateColumns="repeat(3, 1fr)"
          gap="3.2rem"
        >
          {fraktals.map(item => (
            <div key={item.id + "-" + item.tokenId}>
              <NextLink key={item.id} href={`/nft/${item.id}/details`}>
                <NFTItem
                  item={item}
                  name={item.name}
                  amount={null}
                  price={null}
                  imageURL={item.imageURL}
                />
              </NextLink>
            </div>
          ))}
          {isMinting && <Image src="/nft-loading-card.svg" alt="NFTLoading" />}
        </Grid>
      ) : (
        <Center height="104px" width="100%" borderRadius="24" bgColor="#F9F9F9">
          <Text>
            You do not have any NFTs.{" "}
            <Link color="purple.500" href="/list-nft">
              Mint or Import
            </Link>{" "}
            a new NFT.
          </Text>
        </Center>
      )}

      <Flex w="100%" paddingTop="64px">
        <div className={styles.header}>Your Fraktions</div>
      </Flex>
      {fraktions?.length >= 1 && (
        <div style={{ marginTop: "16px" }}>
          <Grid
            mt="40px !important"
            ml="0"
            mr="0"
            mb="5.6rem !important"
            w="100%"
            templateColumns="repeat(3, 1fr)"
            gap="3.2rem"
          >
            {fraktions &&
              fraktions.map(item => (
                <NextLink key={item.id} href={`/nft/${item.id}/details`}>
                  <NFTItem
                    item={item}
                    name={item.name}
                    amount={parseInt(item.userBalance)}
                    price={null}
                    imageURL={item.imageURL}
                  />
                </NextLink>
              ))}
          </Grid>
        </div>
      )} 
      {fraktions?.length <= 0  && (
        <Center
          w="100%"
          borderRadius="24"
          bgColor="#F9F9F9"
          paddingTop="40px"
          paddingBottom="40px"
        >
          <VStack>
            <Text noOfLines={2} textAlign="center">
              Head over to the{" "}
              <Link color="purple.500" href="/">
                Marketplace
              </Link>{" "}
              and invest to get some Fraktions!
              <br />
              If you have already invested, contributions do not appear until
              the auctions are over.
            </Text>
            <NextLink href={"/"}>
              <FrakButton
                isOutlined
                style={{ width: "240px", marginTop: "24px" }}
              >
                Back to Marketplace
              </FrakButton>
            </NextLink>
          </VStack>
        </Center>
      )}

      <Box width="100%" paddingTop="64px">
        <RescueCard
          marketAddress={marketAddress}
          provider={provider}
          gains={Math.round(balance * 1000) / 1000}
        />
      </Box>

      <Flex w="100%" paddingTop="64px">
        <div className={styles.header}>Your Wallet NFTs</div>
        <Spacer />
        <Box justifyContent="center-vertical">
          <NextLink href={`/list-nft`}>
            <FrakButton style={{ width: "151px", marginTop: "6px" }}>
              Import
            </FrakButton>
          </NextLink>
        </Box>
      </Flex>
      {nfts?.length > 0 && (
        <Grid
          mt="40px !important"
          ml="0"
          mr="0"
          mb="5.6rem !important"
          w="100%"
          templateColumns="repeat(3, 1fr)"
          gap="3.2rem"
        >
          {nfts.map(item => (
            <div key={item.id + "-" + item.tokenId}>
              {item.token_schema == "ERC1155" && item.tokenId == 0 ? (
                <NFTItemOS
                  item={item}
                  CTAText={"Import to market"}
                  onClick={() => importFraktalToMarket(item)}
                />
              ) : (
                <NFTItemOS
                  item={item}
                  CTAText={"Import"}
                  onClick={() => importNFT(item)}
                />
              )}
            </div>
          ))}
        </Grid>
      )}
      {nfts?.length <= 0 && (
        <Center
          w="100%"
          borderRadius="24"
          bgColor="#F9F9F9"
          paddingTop="40px"
          paddingBottom="40px"
          mb="5.6rem !important"
        >
          <Text>No NFTs in your wallet.</Text>
        </Center>
      )}
    </VStack>
  );
}
