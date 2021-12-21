import {
  Box,
  Center,
  Flex,
  Grid,
  Link,
  Spacer,
  Text,
  VStack,
  Spinner,
} from "@chakra-ui/react";
import { Image } from "@chakra-ui/react";
import Head from "next/head";
import React from "react";
import NFTItemOS from "../components/nft-item-opensea";
import NFTItem from "../components/nft-item";
import NFTAuctionItem from "@/components/nft-auction-item";
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
import { useEffect } from "react";

export default function MyNFTsView() {
  const router = useRouter();
  const { account, provider, factoryAddress, marketAddress } = useWeb3Context();
  const { fraktals, fraktions, nfts, balance, loading } = useUserContext();



  const sampleEndtime = String((Date.now()/1000)+(60*45));
  const sampleAuctionItem = {
    "creator": "0x06b53e2289d903ba0e23733af8fbd26ad3b6c9fa",
    "marketId": "38",
    "createdAt": "1638534229",
    "endTime": sampleEndtime,
    // "endTime": "1640893165",
    "tokenAddress": "0xb02c6cf605e871d7ad975147372ab1227425cb61",
    "holders": 3,
    "raised": "0",
    "id": "0x06b53e2289d903ba0e23733af8fbd26ad3b6c9fa-0xb02c6cf605e871d7ad975147372ab1227425cb612",
    "price": "700.0",
    "amount": "1",
    "seller": "0x06b53e2289d903ba0e23733af8fbd26ad3b6c9fa",
    "name": "Auction Test Item(in progress)",
    "imageURL": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Image_created_with_a_mobile_phone.png/1200px-Image_created_with_a_mobile_phone.png",
    "wait":"2000",
  };
  const sampleEndtime2 = String((Date.now()/1000)+(5));
  const sampleAuctionItem2 = {
    "creator": "0x06b53e2289d903ba0e23733af8fbd26ad3b6c9fa",
    "marketId": "38",
    "createdAt": "1638534229",
    "endTime": sampleEndtime2,
    // "endTime": "1640893165",
    "tokenAddress": "0xb02c6cf605e871d7ad975147372ab1227425cb61",
    "holders": 3,
    "raised": "0",
    "id": "0x06b53e2289d903ba0e23733af8fbd26ad3b6c9fa-0xb02c6cf605e871d7ad975147372ab1227425cb612",
    "price": "700.0",
    "amount": "1",
    "seller": "0x06b53e2289d903ba0e23733af8fbd26ad3b6c9fa",
    "name": "Auction Test Item(promply ending)",
    "imageURL": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Image_created_with_a_mobile_phone.png/1200px-Image_created_with_a_mobile_phone.png",
    "wait":"2000",
  };
  // const auction = [];
  const auctions = [sampleAuctionItem,sampleAuctionItem2];

  const { isMinting, setIsMinting } = useMintingContext();

  useEffect(() => {
    let nftLocalDataString = window?.localStorage.getItem("mintingNFTs");
    let nftLocalData = JSON.parse(nftLocalDataString);
    nftLocalData?.forEach((address, index) => {
      fraktals?.forEach(frak => {
        if (address.toLocaleLowerCase() === frak.id) {
          nftLocalData.splice(index, 1);
        }
      });
    });
    nftLocalDataString = JSON.stringify(nftLocalData);
    window?.localStorage.setItem("mintingNFTs", nftLocalDataString);
  }, [fraktals]);

  // useEffect(() => {
  //   if (account) {
  //     console.log("account", account);
  //   }
  //   if (fraktals) {
  //     console.log("fraktals", fraktals);
  //   }
  //   if (fraktions) {
  //     console.log("fraktions", fraktions);
  //   }
  //   if (nfts) {
  //     console.log("nfts", nfts);
  //   }
  // }, [account, fraktals, fraktions, nfts, balance]);

  useEffect(() => {
    if (window) {
      if (!window?.localStorage.getItem("mintingNFTs")) {
        setIsMinting(false);
      }
      if (window?.localStorage.getItem("mintingNFTs")) {
        let mintingNFTsString = window?.localStorage.getItem("mintingNFTs");
        let mintingNFTs = JSON.parse(mintingNFTsString);
        if (mintingNFTs && mintingNFTs.length > 0) {
          setIsMinting(true);
        }
        if (mintingNFTs && mintingNFTs.length <= 0) {
          setIsMinting(false);
        }
      }
    }
  }, []);

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
              Mint NFT
            </FrakButton>
          </NextLink>
        </Box>
      </Flex>
      {!loading && fraktals?.length > 0 && (
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
          
        </Grid>
      )}
      {!loading && fraktals?.length <= 0 && isMinting && (
        <Grid
          mt="40px !important"
          ml="0"
          mr="0"
          mb="5.6rem !important"
          w="100%"
          templateColumns="repeat(3, 1fr)"
          gap="3.2rem"
        >
          <Image src="/nft-loading-card.svg" alt="NFTLoading" />
        </Grid>
      )}
      {!loading && !isMinting && fraktals?.length <= 0 && (
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
      {loading && (
        <Center height="104px" width="100%" borderRadius="24" bgColor="#F9F9F9">
          <Spinner size="xl" />
        </Center>
      )}
      <Flex w="100%" paddingTop="64px">
        <div className={styles.header} id="yourFraktions">Your Fraktions</div>
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
      {!loading && fraktions == null && (
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
      {loading && (
        <Center height="104px" width="100%" borderRadius="24" bgColor="#F9F9F9">
          <Spinner size="xl" />
        </Center>
      )}
      <Flex w="100%" paddingTop="64px">
        <div className={styles.header} id="auctions">Auctions</div>
      </Flex>
      {auctions?.length >= 1 && (
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
            {auctions &&
              auctions.map(item => (
                <NextLink key={item.tokenAddress} href={`/nft/${item.tokenAddress}/auction`}>
                  <NFTAuctionItem
                    item={item}
                    name={item.name}
                    amount={parseInt(item.amount)}
                    price={item.price}
                    imageURL={item.imageURL}
                    endTime={item.endTime}
                    showProgress={true}
                  />
                </NextLink>
              ))}
          </Grid>
        </div>
      )}
      {!loading && auctions==null && (
        <Center height="104px" width="100%" borderRadius="24" bgColor="#F9F9F9">
          <Text>
            You do not have any auction to be claimed.
          </Text>
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
      {!loading && nfts == null && (
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
      {loading && (
        <Center height="104px" width="100%" borderRadius="24" bgColor="#F9F9F9">
          <Spinner size="xl" />
        </Center>
      )}
    </VStack>
  );
}
