/**
 * React
 */
import {useCallback, useEffect, useState} from 'react';

/**
 * Chakra
 */
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
/**
 * Components
 */
import FrakButton4 from '@/components/button4';
import ListCardAuction from '@/components/listCardAuction';
import NFTImportCardOS from '@/components/nft-importcard-opensea';
import NFTCard from '@/components/nftCard';
import ListCard from '../components/listCard';
/**
 * Redux
 */
import { connect } from 'react-redux';
import { useRouter } from 'next/router';
/**
 * Routes
 */
import {
  CREATE_NFT,
  resolveAuctionNFTRoute,
  resolveNFTRoute,
} from '@/constants/routes';

import { utils } from 'ethers';
import toast from 'react-hot-toast';
import { Workflow } from 'types/workflow';
/**
 * Context
 */
import { useUserContext } from '@/contexts/userContext';
import { useWeb3Context } from '@/contexts/Web3Context';
/**
 * Redux Actions
 */
import {
  APPROVE_TOKEN,
  IMPORT_FRAKTAL,
  IMPORT_NFT,
  LISTING_NFT,
  rejectContract,
  closeModal,
} from '../redux/actions/contractActions';
/**
 * Redux
 */
import store from '../redux/store';
/**
 * Contracts Calls
 */
import {
  approveMarket,
  getIndexUsed,
  importERC1155,
  importERC721,
  importFraktal,
  listItem,
  listItemAuction,
} from '@/utils/contractCalls';
/**
 * Utils
 */
import {createObject, createObject2, createOpenSeaObject} from "@/utils/nftHelpers";
import {assetsInWallet} from "@/utils/openSeaAPI";
import {getSubgraphData} from "@/utils/graphQueries";

/**
 * Inifinte Scroll
 */
import InfiniteScrollNft from "@/components/infiniteScrollNft";

const MAX_FRACTIONS = 10000;

const actionOpts = { workflow: Workflow.IMPORT_NFT };

function ImportNFTPage() {
  const { account, provider, factoryAddress, marketAddress } = useWeb3Context();

  const router = useRouter();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [noNFTs, setNoNFTs] = useState<boolean>(false);
  const [nfts, setNFTs] = useState([]);

  const [importingNFT, setImportingNFT] = useState<boolean>(false);
  const [isFactoryApproved, setIsFactoryApproved] = useState<boolean>(false);
  const [isNFTImported, setIsNFTImported] = useState<boolean>(false);
  const [isMarketApproved, setIsMarketApproved] = useState<boolean>(false);
  const [isFraktionsAllowed, setIsFraktionsAllowed] = useState<boolean>(false);
  const [isNFTListed, setIsNFTListed] = useState<boolean>(false);
  const [isIntendedForListing, setIsIntentedForListing] = useState<boolean>(true );

  const [tokenMintedAddress, setTokenMintedAddress] = useState<string>('');
  const [NFTName, setNFTName] = useState<string>('');
  const [NFTDescription, setNFTDescription] = useState<string>('');
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  const [tokenToImport, setTokenToImport] = useState<object>({});

  const [isAuction, setIsAuction] = useState(false);

  /**
   * Pagination
   */
  const [limit, setLimit] = useState(15);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  /**
   * Approve Factory
   */
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

  /**
   * Import NFT
   */
  async function importNFT() {
    let address;
    if (typeof tokenToImport === 'undefined') {
      alert('No Token Selected');
      return null;
    }
    console.log('schema', tokenToImport?.token_schema)
    if (tokenToImport?.token_schema === 'ERC721') {
      address = await importERC721(
        BigInt(tokenToImport?.tokenId),
        tokenToImport?.id,
        provider,
        factoryAddress,
        actionOpts
      ).catch((error) => {
        console.log('error', error)
        store.dispatch(
          rejectContract(IMPORT_NFT, error, importNFT, actionOpts)
        );
      });
    }
    if (tokenToImport?.token_schema === 'ERC1155') {
      address = await importERC1155(
        BigInt(tokenToImport?.tokenId),
        tokenToImport?.id,
        provider,
        factoryAddress,
        actionOpts
      ).catch((error) => {
        console.log('error', error)
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

  /**
   * Use effect if NFT is imported
   */
  useEffect(() => {
    if (isNFTImported) {
      approveForMarket();
    }
  }, [isNFTImported, tokenMintedAddress]);

  /**
   * Import Fraktal to Market
   */
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

  const airdropCheck = (_tokenMintedAddress) => {
    const id = `firstMinted-${account}`;
    if( window?.localStorage.getItem(id) == null){
      window?.localStorage.setItem(`firstMinted-${account}`, _tokenMintedAddress.toString());
    }
  }

  /**
   * List new item
   */
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
        airdropCheck(tokenMintedAddress);
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

  /**
   * List new Auction Imp
   */
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
        airdropCheck(tokenMintedAddress);
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
    if (account) {
      setNFTs([]);
      setOffset(0);
      setIsLoading(true);
      fetchNFTs();
    }
  }, [account]);

  async function getData() {
    let totalNFTs = [];
    let nftsERC721Wallet;
    let nftsERC1155Wallet;
    let fraktionsObjects;
    let fraktionsObjectsClean;
    let fraktalsClean: null | any[];
    let totalAddresses: null | string[];
    let nftObjectsClean;

    let openseaAssets = await assetsInWallet(account, {
      limit: limit,
      offset: offset
    });

    if (openseaAssets && openseaAssets.assets && openseaAssets.assets.length === 0) {
      setHasMore(false);
      console.log('NO OPENSEA?')
      return;
    }

    let fobjects = await getSubgraphData(
        "wallet",
        account.toLocaleLowerCase()
    );

    if (fobjects && fobjects.users.length) {
      // Fraktions retrieval
      let validFraktions = fobjects.users[0].fraktions.filter(x => {
        return x.status != "retrieved";
      });

      fraktionsObjects = await Promise.all(
          validFraktions.map(x => {
            return createObject(x);
          })
      );

      if (fraktionsObjects) {
        fraktionsObjectsClean = fraktionsObjects.filter(x => {
          return x != null;
        });
      }
      // Fraktals retrieval
      let userFraktalsFetched = fobjects.users[0].fraktals;

      let userFraktalObjects = await Promise.all(
          userFraktalsFetched.map(x => {
            return createObject2(x);
          })
      );

      if (userFraktalObjects) {
        fraktalsClean = userFraktalObjects.filter(x => {
          return x != null && x.imageURL.length && x.status != "retrieved";
        });
      }

      let userFraktalAddresses = fraktalsClean.map(x => {
        return x.id;
      });

      let userFraktionsAddreses = fraktionsObjectsClean.map(x => {
        return x.id;
      });

      totalAddresses = userFraktalAddresses.concat(userFraktionsAddreses);
    }

    if (
        openseaAssets &&
        openseaAssets.assets &&
        openseaAssets.assets.length
    ) {
      nftsERC721Wallet = openseaAssets.assets.filter(x => {
        return x.asset_contract.schema_name == "ERC721";
      });

      if (nftsERC721Wallet && nftsERC721Wallet.length) {
        totalNFTs = totalNFTs.concat(nftsERC721Wallet);
      }
      nftsERC1155Wallet = openseaAssets.assets.filter(x => {
        return x.asset_contract.schema_name == "ERC1155";
      });

      totalNFTs = nftsERC721Wallet.concat(nftsERC1155Wallet);
      if (!fobjects || !fobjects.users[0] || !fobjects.users[0].fraktals) {
        totalAddresses = [];
      }

      // NFTs filtering
      let nftsFiltered = totalNFTs.map(x => {
        if (!totalAddresses.includes(x.asset_contract.address)) {
          return x;
        }
      });

      let nftObjects = await Promise.all(
          nftsFiltered.map(x => {
            return createOpenSeaObject(x);
          })
      );

      if (nftObjects) {
        nftObjectsClean = nftObjects.filter(x => {
          return x != null && x.imageURL.length;
        });
      } else {
        nftObjectsClean = nftObjects;
      }
      setHasMore(true);
      setNFTs([...nfts, ...nftObjectsClean]);
      setOffset(limit + offset);
    }
  }

  const fetchNFTs = useCallback(
      async () => {
        getData()
        setIsLoading(false);
      },
      [account]
  );

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
            <InfiniteScrollNft
                setImportingNFT={setImportingNFT}
                setTokenToImport={setTokenToImport}
                hasMore={hasMore}
                getData={getData}
                nftItems={nfts}/>
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
                                setIsIntentedForListing(true)
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
                                setIsIntentedForListing(true)
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
                        onClick={() => setIsIntentedForListing(true)}
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