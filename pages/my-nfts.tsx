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
  useToast,
} from '@chakra-ui/react';
import { Image } from '@chakra-ui/react';
import Head from 'next/head';
import React from 'react';
import NFTItemOS from '../components/nft-item-opensea';
import NFTItem from '../components/nft-item';
import NFTAuctionItem from '@/components/nft-auction-item';
import RescueCard from '../components/rescueCard';
import NextLink from 'next/link';
import styles from '../styles/my-nfts.module.css';
import FrakButton from '../components/button';
import { useWeb3Context } from '../contexts/Web3Context';
import { useUserContext } from '../contexts/userContext';
import { useMintingContext } from '@/contexts/NFTIsMintingContext';
import {
  importFraktal,
  approveMarket,
  importERC721,
  importERC1155,
  getApproved,
  estimateRedeemAuctionSeller,
  getListingAmount,
} from '../utils/contractCalls';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getSubgraphAuction } from 'utils/graphQueries';
import { createListedAuction } from 'utils/nftHelpers';
import { utils } from 'ethers';
import {
  unlistAuctionItem,
  redeemAuctionSeller,
  redeemAuctionParticipant,
  getAuctionReserve,
  getParticipantContribution,
  getAuctionListings,
} from '../utils/contractCalls';
import { useLoadingScreenHandler } from '../hooks/useLoadingScreen'

import { EXPLORE } from '@/constants/routes';

export default function MyNFTsView() {
  const router = useRouter();
  const toast = useToast();
  const { account, provider, factoryAddress, marketAddress } = useWeb3Context();
  const { fraktals, fraktions, nfts, balance, loading } = useUserContext();
  const [auctions, setAuctions] = useState(null);
  const [participatedAuctions, setParticipatedAuctions] = useState(null);
  const [userAccount, setUserAccount] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const { isMinting, setIsMinting } = useMintingContext();
  const { closeLoadingModalAfterDelay } = useLoadingScreenHandler()

  const refreshPage = () => {
    setRefresh(!refresh);
  };

  const sellerEndAuction = async (tokenAddress, sellerNonce) => {
    unlistAuctionItem(tokenAddress, sellerNonce, provider, marketAddress)
      .then(() => {
        toast({
          title: 'Auction unlisted',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
        refreshPage();
      })
      .catch((e) => {
        toast({
          title: e.message,
          status: 'error',
          duration: 2000,
          isClosable: true,
        });
        console.log(e);
      });
  };

  const userClaimFrak = async (tokenAddress, seller, sellerNonce) => {
    redeemAuctionParticipant(
      tokenAddress,
      seller,
      sellerNonce,
      provider,
      marketAddress
    )
      .then(() => {
        toast({
          title: 'Redeemed Fraktions successfully',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
        refreshPage();
        closeLoadingModalAfterDelay()
      })
      .catch((e) => {
        toast({
          title: e.message,
          status: 'error',
          duration: 2000,
          isClosable: true,
        });
      });
  };

  const auctionReserve = async (seller, sellerNonce) => {
    const reserve = await getAuctionReserve(
      seller,
      sellerNonce,
      provider,
      marketAddress
    );
    return reserve;
  };
  const auctionSuccess = async (
    tokenAddress,
    seller,
    sellerNonce,
    auctionReserve
  ) => {
    const auction = await getAuctionListings(
      tokenAddress,
      seller,
      sellerNonce,
      provider,
      marketAddress
    );
    let success;

    if (auctionReserve.gt(auction[1])) {
      success = true;
    } else {
      success = false;
    }

    return success;
  };

  const participantContribution = async (seller, sellerNonce, participant) => {
    const reserve = await getParticipantContribution(
      seller,
      sellerNonce,
      participant,
      provider,
      marketAddress
    );
    return reserve;
  };

  const sellerClaimEth = async (tokenAddress, seller, sellerNonce) => {
    redeemAuctionSeller(
      tokenAddress,
      seller,
      sellerNonce,
      provider,
      marketAddress
    )
      .then(() => {
        toast({
          title: 'Redeemed ETH successfully',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
        refreshPage();
        closeLoadingModalAfterDelay()
      })
      .catch((e) => {
        toast({
          title: e.message,
          status: 'error',
          duration: 2000,
          isClosable: true,
        });
        console.log(e);
      });
  };

  useEffect(() => {
    if (account != userAccount) {
      setUserAccount(account);
    }
  });

  useEffect(() => {
    const getAuctions = async () => {
      let auctionData = await getSubgraphAuction('auctions', '');
      let auctionDataParticipated = { ...auctionData };
      auctionDataParticipated = auctionDataParticipated?.auctions?.filter(
        (x) => {
          let contained = false;
          x.participants.map((participant) => {
            if (participant == account?.toLocaleLowerCase()) {
              contained = true;
            }
          });
          return contained;
        }
      );
      auctionData = auctionData?.auctions?.filter(
        (x) => x.seller.id == account?.toLocaleLowerCase()
      );

      let auctionDataHash = [];
      await Promise.all(
        auctionData?.map(async (x) => {
          let _hash = await getSubgraphAuction('auctionsNFT', x.tokenAddress);

          if (_hash.fraktalNft != null) {
            const itm = {
              id: `${x.tokenAddress}-${x.sellerNonce}`,
              hash: _hash.fraktalNft.hash,
            };
            auctionDataHash.push(itm);
          }
        })
      );
      let auctionItems = [];
      await Promise.all(
        auctionData?.map(async (auction, idx) => {
          let hash = auctionDataHash.filter(
            (e) => e.id == `${auction.tokenAddress}-${auction.sellerNonce}`
          );

          if (hash[0] != undefined) {
            Object.assign(auction, { hash: hash[0].hash });
            const item = await createListedAuction(auction);
            auctionItems.push(item);
          }
        })
      );

      let auctionDataParticipatedHash = [];
      await Promise.all(
        auctionDataParticipated?.map(async (x) => {
          let _hash = await getSubgraphAuction('auctionsNFT', x.tokenAddress);

          if (_hash.fraktalNft != null) {
            const itm = {
              id: `${x.tokenAddress}-${x.sellerNonce}`,
              hash: _hash.fraktalNft.hash,
            };
            auctionDataParticipatedHash.push(itm);
          }
        })
      );

      let participatedAuctionItems = [];
      await Promise.all(
        auctionDataParticipated?.map(async (auction, idx) => {
          let hash = auctionDataParticipatedHash.filter(
            (e) => e.id == `${auction.tokenAddress}-${auction.sellerNonce}`
          );

          if (hash[0] != undefined) {
            Object.assign(auction, { hash: hash[0].hash });
            const item = await createListedAuction(auction);
            const contributed = await participantContribution(
              auction.seller,
              auction.sellerNonce,
              account
            );
            const itemReserve = await auctionReserve(
              auction.seller,
              auction.sellerNonce
            );
            const success = await auctionSuccess(
              auction.tokenAddress,
              auction.seller,
              auction.sellerNonce,
              itemReserve
            );

            Object.assign(item, {
              contributed: utils.formatEther(contributed),
              isAuctionSuccess: success,
            });
            auction['assigned'] = 'lol';
            participatedAuctionItems.push(item);
          }
        })
      );

      setParticipatedAuctions(participatedAuctionItems);

      let withReserve = [];
      await Promise.all(
        auctionItems.map(async (i) => {
          const itemReserve = await auctionReserve(i.seller, i.sellerNonce);
          // const auctionSuccess = (itemReserve>i.reservePrice?true:false);
          const success = await auctionSuccess(
            i.tokenAddress,
            i.seller,
            i.sellerNonce,
            itemReserve
          );

          i['currentReserve'] = utils.formatEther(itemReserve);
          i['isAuctionSuccess'] = success;
          // withReserve.push(i);
        })
      );

      auctionItems = auctionItems.sort((a, b) => b.endTime - a.endTime);

      await Promise.all(
        auctionItems.map(async (i) => {
          try {
            const estimate = await estimateRedeemAuctionSeller(
              i.tokenAddress,
              i.seller,
              i.sellerNonce,
              provider,
              marketAddress
            );
          } catch (error) {
            i.currentReserve = 0;
          }
        })
      );

      setAuctions(auctionItems);
    };
    getAuctions();
  }, [userAccount, refresh]);

  useEffect(() => {
    let nftLocalDataString = window?.localStorage.getItem('mintingNFTs');
    let nftLocalData = JSON.parse(nftLocalDataString);
    nftLocalData?.forEach((address, index) => {
      fraktals?.forEach((frak) => {
        if (address.toLocaleLowerCase() === frak.id) {
          nftLocalData.splice(index, 1);
        }
      });
    });
    nftLocalDataString = JSON.stringify(nftLocalData);
    window?.localStorage.setItem('mintingNFTs', nftLocalDataString);
  }, [fraktals]);

  useEffect(() => {
    if (window) {
      if (!window?.localStorage.getItem('mintingNFTs')) {
        setIsMinting(false);
      }
      if (window?.localStorage.getItem('mintingNFTs')) {
        let mintingNFTsString = window?.localStorage.getItem('mintingNFTs');
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
    if (!approved) {
      done = await approveContract(factoryAddress, item.id);
    } else {
      done = true;
    }
    // overflow problem with opensea assets.. subid toooo big
    if (done) {
      if (item.token_schema == 'ERC721') {
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
        <Box className={styles.header}>Your Fraktal NFTs</Box>
        <Spacer />
        <Box>
          <NextLink href={`/list-nft`}>
            <FrakButton style={{ width: '160px', marginTop: '6px' }}>
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
          {fraktals.map((item) => (
            <div key={item.id + '-' + item.tokenId}>
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
            You do not have any NFTs.{' '}
            <Link color="purple.500" href="/list-nft">
              Mint or Import
            </Link>{' '}
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
        <div className={styles.header} id="yourFraktions">
          Your Fraktions
        </div>
      </Flex>
      {fraktions?.length >= 1 && (
        <div style={{ marginTop: '16px' }}>
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
              fraktions.map((item) => (
                <NextLink key={item.id} href={`/nft/${item.id}/details`}>
                  <NFTItem
                    item={item}
                    name={item.name}
                    amount={item.userBalance}
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
              Head over to the{' '}
              <Link color="purple.500" href="/">
                Marketplace
              </Link>{' '}
              and invest to get some Fraktions!
              <br />
              If you have already invested, contributions do not appear until
              the auctions are over.
            </Text>
            <NextLink href={EXPLORE}>
              <FrakButton
                isOutlined
                style={{ width: '240px', marginTop: '24px' }}
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
        <div className={styles.header} id="auctions">
          Auctions
        </div>
      </Flex>
      <Flex w="100%">
        <div className={styles.header2} id="auctions">
          Contributed
        </div>
      </Flex>
      {participatedAuctions?.length >= 1 && (
        <div style={{ marginTop: '16px' }}>
          <Grid
            mt="40px !important"
            ml="0"
            mr="0"
            mb="5.6rem !important"
            w="100%"
            templateColumns="repeat(3, 1fr)"
            gap="3.2rem"
          >
            {participatedAuctions &&
              participatedAuctions.map((item) => (
                <NextLink
                  key={`${item.seller}-${item.sellerNonce}`}
                  href={`/nft/${item.seller}-${item.sellerNonce}/auction`}
                >
                  <NFTAuctionItem
                    item={item}
                    name={item.name}
                    amount={Number(
                      utils.formatEther(
                        item.amountOfShare != undefined ? item.amountOfShare : 0
                      )
                    )}
                    price={item.price}
                    imageURL={item.imageURL}
                    endTime={item.endTime}
                    showProgress={true}
                    claimType={'participant'}
                    claimFunction={userClaimFrak}
                    unlistFunction={sellerEndAuction}
                  />
                </NextLink>
              ))}
          </Grid>
        </div>
      )}
      {!loading && participatedAuctions?.length == 0 && (
        <Center height="104px" width="100%" borderRadius="24" bgColor="#F9F9F9">
          <Text>You do not have any auction to be claimed.</Text>
        </Center>
      )}
      <Flex w="100%">
        <div className={styles.header2} id="auctions">
          My Auction
        </div>
      </Flex>
      {auctions?.length >= 1 && (
        <div style={{ marginTop: '16px' }}>
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
              auctions.map((item) => (
                <NextLink
                  key={`${item.seller}-${item.sellerNonce}`}
                  href={`/nft/${item.seller}-${item.sellerNonce}/auction`}
                >
                  <NFTAuctionItem
                    item={item}
                    name={item.name}
                    amount={utils.formatEther(item?.amountOfShare)}
                    price={item.price}
                    imageURL={item.imageURL}
                    endTime={item.endTime}
                    showProgress={true}
                    claimType={'seller'}
                    claimFunction={sellerClaimEth}
                    unlistFunction={sellerEndAuction}
                  />
                </NextLink>
              ))}
          </Grid>
        </div>
      )}
      {!loading && auctions?.length == 0 && (
        <Center height="104px" width="100%" borderRadius="24" bgColor="#F9F9F9">
          <Text>
            You do not have any auction. List auction at{' '}
            <Link color="purple.500" href="/list-nft">
              list-nft
            </Link>{' '}
            page
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
          {nfts.map((item) => (
            <div key={item.id + '-' + item.tokenId}>
              {item.token_schema == 'ERC1155' && item.tokenId == 0 ? (
                <NFTItemOS
                  item={item}
                  CTAText={'Import to market'}
                  onClick={() => importFraktalToMarket(item)}
                />
              ) : (
                <NFTItemOS
                  item={item}
                  CTAText={'Import'}
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
