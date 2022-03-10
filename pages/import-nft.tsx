import FrakButton4 from '@/components/button4';
import ListCardAuction from '@/components/listCardAuction';
import NFTImportCardOS from '@/components/nft-importcard-opensea';
import NFTCard from '@/components/nftCard';
import { connect } from 'react-redux';

import {
  CREATE_NFT,
  resolveAuctionNFTRoute,
  resolveNFTRoute,
} from '@/constants/routes';

import {
  Box,
  Grid,
  Spinner,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  VStack,
} from '@chakra-ui/react';

import { utils } from 'ethers';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Workflow } from 'types/workflow';
import ListCard from '../components/listCard';
import { useUserContext } from '../contexts/userContext';

import { useWeb3Context } from '../contexts/Web3Context';
import {
  APPROVE_TOKEN,
  IMPORT_FRAKTAL,
  IMPORT_NFT,
  LISTING_NFT,
  rejectContract,
  closeModal,
} from '../redux/actions/contractActions';

import store from '../redux/store';
import {
  approveMarket,
  getIndexUsed,
  importERC1155,
  importERC721,
  importFraktal,
  listItem,
  listItemAuction,
} from '../utils/contractCalls';

const MAX_FRACTIONS = 10000;

const actionOpts = { workflow: Workflow.IMPORT_NFT };

function ImportNFTPage() {
  const { account, provider, factoryAddress, marketAddress } = useWeb3Context();
  const { fraktals, fraktions, nfts, balance } = useUserContext();

  const router = useRouter();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [noNFTs, setNoNFTs] = useState<boolean>(false);

  const [importingNFT, setImportingNFT] = useState<boolean>(false);
  const [isFactoryApproved, setIsFactoryApproved] = useState<boolean>(false);
  const [isNFTImported, setIsNFTImported] = useState<boolean>(false);
  const [isMarketApproved, setIsMarketApproved] = useState<boolean>(false);
  const [isFraktionsAllowed, setIsFraktionsAllowed] = useState<boolean>(false);
  const [isNFTListed, setIsNFTListed] = useState<boolean>(false);
  const [isIntendedForListing, setIsIntentedForListing] = useState<boolean>(
    true
  );

  const [tokenMintedAddress, setTokenMintedAddress] = useState<string>('');
  const [NFTName, setNFTName] = useState<string>('');
  const [NFTDescription, setNFTDescription] = useState<string>('');
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  const [tokenToImport, setTokenToImport] = useState<object>({});

  const [isAuction, setIsAuction] = useState(false);

  async function approveForFactory() {
    if (tokenToImport && tokenToImport.id) {
      let res = await approveMarket(
        factoryAddress,
        provider,
        tokenToImport.id,
        actionOpts
      )
        .then((receipt) => {
          setIsFactoryApproved(true);
          importNFT();
        })
        .catch((error) => {
          store.dispatch(
            rejectContract(APPROVE_TOKEN, error, approveForFactory, actionOpts)
          );
        });
    }
  }

  async function approveForMarket() {
    const _actionsOpts = {
      ...actionOpts,
      custom: 'fraktions',
    };
    let response = await approveMarket(
      marketAddress,
      provider,
      tokenMintedAddress,
      _actionsOpts
    )
      .then((receipt) => {
        setIsMarketApproved(true);
        importFraktalToMarket();
      })
      .catch((error) => {
        store.dispatch(
          rejectContract(APPROVE_TOKEN, error, approveForMarket, _actionsOpts)
        );
      });
  }

  async function importNFT() {
    let address;
    if (typeof tokenToImport === 'undefined') {
      alert('No Token Selected');
      return null;
    }
    if (tokenToImport?.token_schema === 'ERC721') {
      address = await importERC721(
        parseInt(tokenToImport?.tokenId),
        tokenToImport?.id,
        provider,
        factoryAddress,
        actionOpts
      ).catch((error) => {
        store.dispatch(
          rejectContract(IMPORT_NFT, error, importNFT, actionOpts)
        );
      });
    }
    if (tokenToImport?.token_schema === 'ERC1155') {
      address = await importERC1155(
        parseInt(tokenToImport?.tokenId),
        tokenToImport?.id,
        provider,
        factoryAddress,
        actionOpts
      ).catch((error) => {
        store.dispatch(
          rejectContract(IMPORT_NFT, error, importNFT, actionOpts)
        );
      });
    }
    if (address?.length > 0) {
      setTokenMintedAddress(address);
      setIsNFTImported(true);
      if (!isIntendedForListing) {
        setTimeout(() => {
          closeModal()
          router.push(resolveNFTRoute(address));
        }, 2000);
      }
    }
  }

  useEffect(() => {
    if (isNFTImported) {
      approveForMarket();
    }
  }, [isNFTImported, tokenMintedAddress]);

  async function importFraktalToMarket() {
    let tokenID = 0;
    let isUsed = true;
    // todo: add spinner
    while (isUsed == true) {
      // finds the next tokenID available
      tokenID += 1;
      isUsed = await getIndexUsed(tokenID, provider, tokenMintedAddress);
    }

    if (isUsed == false) {
      const response = await importFraktal(
        tokenMintedAddress,
        tokenID,
        provider,
        marketAddress,
        actionOpts
      )
        .then((receipt) => {
          setIsFraktionsAllowed(true);
          listFraktions();
        })
        .catch((error) => {
          store.dispatch(
            rejectContract(
              IMPORT_FRAKTAL,
              error,
              importFraktalToMarket,
              actionOpts
            )
          );
        });
    }
  }

  async function listNewItem() {
    const wei = utils.parseEther(totalPrice.toString());
    const fei = utils.parseEther(totalAmount.toString());
    const weiPerFrak = wei.mul(utils.parseEther('1.0')).div(fei);
    const response = await listItem(
      tokenMintedAddress,
      fei, // amount of fraktions to list
      weiPerFrak, // price per fraktal
      provider,
      marketAddress,
      actionOpts
    )
      .then((receipt) => {
        setIsNFTListed(true);
        setTimeout(() => {
          closeModal()
          router.push(resolveNFTRoute(tokenMintedAddress));
        }, 2000);
      })
      .catch((error) => {
        store.dispatch(
          rejectContract(LISTING_NFT, error, listNewItem, actionOpts)
        );
      });
  }

  async function listNewAuctionItem() {
    const response = await listItemAuction(
      tokenMintedAddress,
      utils.parseUnits(totalPrice),
      utils.parseUnits(totalAmount),
      provider,
      marketAddress,
      actionOpts
    )
      .then((receipt) => {
        setIsNFTListed(true);
        setTimeout(() => {
          closeModal()
          router.push(resolveAuctionNFTRoute(tokenMintedAddress));
        }, 2000);
      })
      .catch((error) => {
        store.dispatch(
          rejectContract(LISTING_NFT, error, listItemAuction, actionOpts)
        );
      });
  }

  const listFraktions = async () => {
    if (totalPrice == 0 || totalAmount == 0) {
      toast.error('Please input price and amount of fraktions');
    } else {
      if (isAuction) {
        listNewAuctionItem();
      } else {
        listNewItem();
      }
    }
  };

  // Show Loading State
  useEffect(() => {
    if (nfts !== null) {
      setIsLoading(false);
      setNoNFTs(false);
    }
    if (nfts === null) {
      setTimeout(() => {
        setIsLoading(false);
        setNoNFTs(true);
      }, 20000);
    }
  }, [nfts]);

  // Set Stuff Up After Import Token Selected
  useEffect(() => {
    if (Object.keys(tokenToImport).length > 0) {
      setNFTName(tokenToImport?.name);
    }
  }, [tokenToImport]);

  return (
    <>
      {isLoading && <Spinner size="xl" />}
      {!isLoading && (
        <>
          {/* Title Elements */}
          <Box sx={{ display: `flex`, width: `100%`, alignItems: `center` }}>
            <Text
              sx={{
                fontFamily: `Inter`,
                fontSize: `48px`,
                fontWeight: `700`,
                width: `clamp(175px, 33vw, 350px)`,
              }}
            >
              Import NFT
            </Text>
            <Box
              sx={{
                display: `block`,
                padding: `1rem 2rem`,
                height: `auto`,
                margin: `0 1rem`,
              }}
              _hover={{
                backgroundColor: `black`,
                color: `white`,
                borderRadius: `24px`,
                cursor: `pointer`,
              }}
              onClick={() => router.push(CREATE_NFT)}
            >
              Mint NFT
            </Box>
            <Box
              sx={{
                display: `block`,
                padding: `1rem 2rem`,
                backgroundColor: `black`,
                borderRadius: `24px`,
                color: `white`,
                height: `auto`,
              }}
              _hover={{ cursor: `pointer` }}
            >
              Import NFT
            </Box>
          </Box>
          {!importingNFT && (
            <Box sx={{ width: `100%` }}>
              <Text
                sx={{
                  textTransform: `uppercase`,
                  opacity: `0.8`,
                  fontWeight: `700`,
                }}
              >
                Select an NFT from your wallet
              </Text>
            </Box>
          )}
          {/* End Title Elements */}
        </>
      )}
      {!importingNFT && nfts?.length >= 1 && (
        <>
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
                <NFTImportCardOS
                  item={item}
                  CTAText={'Import to market'}
                  onClick={() => {
                    setTokenToImport(item);
                    setImportingNFT(true);
                  }}
                />
              </div>
            ))}
          </Grid>
        </>
      )}
      {!isLoading && noNFTs && (
        <>
          <Text
            sx={{
              fontFamily: `Inter, sans-serif`,
              fontWeight: `700`,
              fontSize: `48px`,
            }}
          >
            You have no NFTs.
          </Text>
        </>
      )}
      {!isLoading && importingNFT && (
        <>
          <Grid
            sx={{
              gridTemplateColumns: `2fr 4fr`,
              width: `100%`,
              columnGap: `5vw`,
            }}
          >
            <VStack>
              <Box sx={{ width: `100%` }}>
                <Text
                  sx={{
                    textTransform: `uppercase`,
                    opacity: `0.8`,
                    fontWeight: `700`,
                    width: `100%`,
                    textAlign: `left`,
                  }}
                >
                  Preview
                </Text>
                <Box sx={{ height: `2rem` }}></Box>
                <NFTImportCardOS
                  item={tokenToImport}
                  CTAText={'Import to market'}
                  onClick={() => {
                    alert('Meow');
                  }}
                />
              </Box>
            </VStack>
            <Box
              sx={{
                display: `flex`,
                flexDirection: `column`,
                width: `clamp(200px, 100%, 50ch)`,
              }}
            >
              <div>
                <NFTCard
                  setName={setNFTName}
                  setDescription={setNFTDescription}
                  addFile={() => {}}
                  file={null}
                  fileUpload={false}
                />
              </div>
              <Box
                sx={{
                  display: `flex`,
                  gap: `12px`,
                  alignItems: `center`,
                  marginBottom: `8px`,
                }}
              >
                {isIntendedForListing && (
                  <Box
                    sx={{
                      width: `16px`,
                      height: `16px`,
                      borderRadius: `4px`,
                      display: `block`,
                      backgroundColor: `#00C49D`,
                    }}
                    _hover={{
                      cursor: `pointer`,
                    }}
                    onClick={() =>
                      setIsIntentedForListing(!isIntendedForListing)
                    }
                  ></Box>
                )}
                {!isIntendedForListing && (
                  <Box
                    sx={{
                      width: `16px`,
                      height: `16px`,
                      borderRadius: `4px`,
                      border: `2px solid rgba(0,0,0,0.3)`,
                      display: `block`,
                    }}
                    _hover={{
                      cursor: `pointer`,
                    }}
                    onClick={() =>
                      setIsIntentedForListing(!isIntendedForListing)
                    }
                  ></Box>
                )}
                <Text
                  sx={{
                    fontSize: `16px`,
                    fontFamily: `Inter, sans-serif`,
                    fontWeight: `700`,
                  }}
                  _hover={{
                    cursor: `pointer`,
                  }}
                  onClick={() => setIsIntentedForListing(!isIntendedForListing)}
                >
                  Sell Fraktions
                </Text>
              </Box>
              <div>
                {isIntendedForListing && (
                  <Tabs
                    isFitted
                    variant="enclosed"
                    onChange={(e) => setIsAuction(!isAuction)}
                  >
                    <TabList mb="1em">
                      <Tab _selected={{ fontSize: '1.8rem', color: 'white', background: '#405466', borderRadius: '16px 0 0 16px', fontWeight: 700 }}>Fixed Price</Tab>
                      <Tab _selected={{ fontSize: '1.8rem', color: 'white', background: '#405466', borderRadius: '0 16px 16px 0', fontWeight: 700 }}>Auction</Tab>
                    </TabList>
                    <TabPanels>
                      <TabPanel>
                        <ListCard
                          totalPrice={totalPrice}
                          setTotalPrice={setTotalPrice}
                          totalAmount={totalAmount}
                          setTotalAmount={setTotalAmount}
                          listingProcess={false}
                          maxFraktions={MAX_FRACTIONS}
                        />
                      </TabPanel>
                      <TabPanel>
                        <ListCardAuction
                          totalPrice={totalPrice}
                          setTotalPrice={setTotalPrice}
                          totalAmount={totalAmount}
                          setTotalAmount={setTotalAmount}
                          listingProcess={false}
                          maxFraktions={MAX_FRACTIONS}
                        />
                      </TabPanel>
                    </TabPanels>
                  </Tabs>
                )}
              </div>

              <Box
                sx={{
                  display: `flex`,
                  flexFlow: `row wrap`,
                  gap: `12px`,
                  width: `clamp(150px, 200%, 90ch)`,
                  marginTop: `1rem`,
                }}
              >
                <FrakButton4
                  status={!isFactoryApproved ? 'open' : 'done'}
                  onClick={() => {
                    approveForFactory();
                  }}
                >
                  1. Approve NFT
                </FrakButton4>{' '}
                <FrakButton4
                  status={!isNFTImported ? 'open' : 'done'}
                  onClick={() => {
                    importNFT();
                  }}
                >
                  2. Frak It
                </FrakButton4>{' '}
                <FrakButton4
                  status={!isMarketApproved ? 'open' : 'done'}
                  onClick={() => {
                    approveForMarket();
                  }}
                >
                  3. Approve Fraktions
                </FrakButton4>{' '}
                <FrakButton4
                  status={!isFraktionsAllowed ? 'open' : 'done'}
                  onClick={() => {
                    importFraktalToMarket();
                  }}
                >
                  4. Transfer Fraktions
                </FrakButton4>{' '}
                <FrakButton4
                  status={!isNFTListed ? 'open' : 'done'}
                  onClick={() => {
                    listFraktions();
                  }}
                >
                  5. List Fraktions
                </FrakButton4>
              </Box>
            </Box>
          </Grid>
        </>
      )}
    </>
  );
}

const mapStateToProps = (state) => ({});
const mapDispatchToProps = (dispatch) => {
  return {
    closeModal: () => {
      dispatch(closeModal())
    }
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(ImportNFTPage);