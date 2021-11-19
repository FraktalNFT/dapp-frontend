import { useEffect, useState } from "react";
import {
  VStack,
  Box,
  Grid,
  Spinner,
  Text,
  Input,
  Textarea,
  NumberInput,
  NumberInputField,
  Checkbox,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useWeb3Context } from "../contexts/Web3Context";
import { useUserContext } from "../contexts/userContext";
import NFTImportCardOS from "../components/nft-importcard-opensea";
import ListCard from "../components/listCard";
import {
  createNFT,
  approveMarket,
  importFraktal,
  getIndexUsed,
  listItem,
  getApproved,
  importERC721,
  importERC1155,
} from "../utils/contractCalls";
import { utils } from "ethers";
import FrakButton4 from "@/components/button4";

const { create } = require("ipfs-http-client");

export default function ImportNFTPage() {
  const { account, provider, factoryAddress, marketAddress } = useWeb3Context();
  const { fraktals, fraktions, nfts, balance } = useUserContext();

  const router = useRouter();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [noNFTs, setNoNFTs] = useState<boolean>(false);
  const [fraktionalized, setFraktionalized] = useState<boolean>(false);
  const [nftApproved, setNFTApproved] = useState<boolean>(false);
  const [minted, setMinted] = useState<boolean>(false);
  const [importingNFT, setImportingNFT] = useState<boolean>(false);
  const [isFactoryApproved, setIsFactoryApproved] = useState<boolean>(false);
  const [isNFTImported, setIsNFTImported] = useState<boolean>(false);
  const [isMarketApproved, setIsMarketApproved] = useState<boolean>(false);
  const [isFraktionsAllowed, setIsFraktionsAllowed] = useState<boolean>(false);
  const [isNFTListed, setIsNFTListed] = useState<boolean>(false);
  const [isIntendedForListing, setIsIntentedForListing] = useState<boolean>(
    false
  );

  const [tokenMintedAddress, setTokenMintedAddress] = useState<string>("");
  const [NFTName, setNFTName] = useState<string>("");
  const [NFTDescription, setNFTDescription] = useState<string>("");
  const [totalAmount, setTotalAmount] = useState<string>("");
  const [totalPrice, setTotalPrice] = useState<string>("");

  const [tokenToImport, setTokenToImport] = useState<object>({});

  async function approveForFactory() {
    if (tokenToImport && tokenToImport.id) {
      let res = await approveMarket(factoryAddress, provider, tokenToImport.id);
      if (res?.error) {
        alert(
          "Transaction Failed! Sad! Many Such Cases! Contact the Development Team."
        );
        return null;
      }
      if (!res?.error) {
        setIsFactoryApproved(true);
      }
    }
  }

  async function approveForMarket() {
    let response = await approveMarket(
      marketAddress,
      provider,
      tokenMintedAddress
    );
    if (response.error) {
      alert(
        "Transaction Failed! Sad! Many Such Cases! Contact the Development Team."
      );
      return null;
    }
    if (!response?.error) {
      setIsMarketApproved(true);
    }
  }

  async function importNFT() {
    let address;
    if (typeof tokenToImport === "undefined") {
      alert("No Token Selected");
      return null;
    }
    if (tokenToImport?.token_schema === "ERC721") {
      address = await importERC721(
        parseInt(tokenToImport?.tokenId),
        tokenToImport?.id,
        provider,
        factoryAddress
      );
    }
    if (tokenToImport?.token_schema === "ERC1155") {
      address = await importERC1155(
        parseInt(tokenToImport?.tokenId),
        tokenToImport?.id,
        provider,
        factoryAddress
      );
    }
    if (address?.length > 0) {
      setTokenMintedAddress(address);
      setIsNFTImported(true);
      if (!isIntendedForListing) {
        router.push("/my-nfts");
      }
    }

  }

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
        marketAddress
      );
      if (response?.error) {
        alert(
          "Transaction Failed! Sad! Many Such Cases! Contact the Development Team."
        );
        return null;
      }
      if (!response?.error) {
        setIsFraktionsAllowed(true);
      }
    }
  }

  async function listNewItem() {
    const response = await listItem(
      tokenMintedAddress,
      totalAmount, // amount of fraktions to list
      utils.parseUnits(totalPrice).div(totalAmount), // totalPrice is price for all fraktions sum
      provider,
      marketAddress
    );
    if (response?.error) {
      alert(
        "NFT did not list. Sad! Many Such Cases! Contact the development team immediately"
      );
      return null;
    }
    if (!response?.error) {
      setIsNFTListed(true);
      router.push("/my-nfts");
    }
  }

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
              onClick={() => router.push("/list-nft")}
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
            {nfts.map(item => (
              <div key={item.id + "-" + item.tokenId}>
                <NFTImportCardOS
                  item={item}
                  CTAText={"Import to market"}
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
          {console.log(tokenToImport)}
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
                  CTAText={"Import to market"}
                  onClick={() => {
                    alert("Meow");
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
              <Text sx={{ fontWeight: `700` }}>MetaData</Text>
              <Box>
                <Text my="4">Name</Text>
                <Input
                  value={NFTName}
                  onChange={d => setNFTName(d.target.value) /* d for data */}
                  placeholder="NFT Name"
                  sx={{ fontSize: `14px` }}
                />
              </Box>
              <Box>
                <Text my="4">Description</Text>
                <Textarea
                  value={NFTDescription}
                  onChange={
                    d => setNFTDescription(d.target.value) /* d for data */
                  }
                  placeholder="NFT Description"
                  sx={{ fontSize: `14px` }}
                />
              </Box>
              <Box my={8}>
                <Text sx={{ fontWeight: `700` }}>Fraktionalize</Text>
                <Box sx={{ display: `flex` }}>
                  <Box>
                    <Text>Total Price</Text>
                    <Text sx={{ opacity: `0.75`, fontSize: `13px` }}>
                      Sum Price of ALL Fraktions
                    </Text>
                    <NumberInput
                      placeholder={"5 ETH"}
                      value={totalPrice}
                      onChange={d => setTotalPrice(d) /* d for data */}
                      max={59000000}
                      mt={8}
                    >
                      <NumberInputField
                        sx={{
                          borderRadius: `12px`,
                          fontSize: `14px`,
                          padding: `1ex 1em`,
                          textAlign: `right`,
                          height: `auto`,
                        }}
                      />
                    </NumberInput>
                    <Text sx={{ opacity: `0.75`, fontSize: `12px` }}>
                      Price: {parseInt(totalPrice) / 10000} ETH per fraktion
                    </Text>
                  </Box>
                  <Box sx={{ width: `1ch` }}></Box>
                  <Box>
                    <Text>Fraktions to List</Text>
                    <Text sx={{ opacity: `0.75`, fontSize: `13px` }}>
                      Declare how many Fraktions are for sale
                    </Text>
                    <NumberInput
                      placeholder={"5000"}
                      value={totalAmount}
                      onChange={
                        d => setTotalAmount(d) /* needs regex control */
                      }
                      max={10000}
                      mt={8}
                    >
                      <NumberInputField
                        sx={{
                          borderRadius: `12px`,
                          fontSize: `14px`,
                          padding: `1ex 1em`,
                          textAlign: `right`,
                          height: `auto`,
                        }}
                      />
                    </NumberInput>
                    <Text sx={{ opacity: `0.75`, fontSize: `12px` }}>
                      Out of 10,000 Fraktions
                    </Text>
                  </Box>
                </Box>
              </Box>
              <Checkbox
                isChecked={isIntendedForListing}
                onChange={() => setIsIntentedForListing(v => !v)}
                size="lg"
              >
                List your Fraktions for sale
              </Checkbox>
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
                  status={!isFactoryApproved ? "open" : "done"}
                  onClick={() => {
                    approveForFactory();
                  }}
                >
                  1. Approve NFT Access
                </FrakButton4>{" "}
                <FrakButton4
                  status={!isNFTImported ? "open" : "done"}
                  onClick={() => {
                    importNFT();
                  }}
                >
                  2. Import NFT
                </FrakButton4>{" "}
                <FrakButton4
                  status={!isMarketApproved ? "open" : "done"}
                  onClick={() => {
                    approveForMarket();
                  }}
                >
                  3. Approve Fraktion Access
                </FrakButton4>{" "}
                <FrakButton4
                  status={!isFraktionsAllowed ? "open" : "done"}
                  onClick={() => {
                    importFraktalToMarket();
                  }}
                >
                  4. Transfer Fraktions to Market
                </FrakButton4>{" "}
                <FrakButton4
                  status={!isNFTListed ? "open" : "done"}
                  onClick={() => {
                    listNewItem();
                  }}
                >
                  5. List Fraktions for Sale
                </FrakButton4>
              </Box>
            </Box>
          </Grid>
        </>
      )}
    </>
  );
}
