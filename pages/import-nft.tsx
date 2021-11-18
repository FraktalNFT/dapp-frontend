import { useEffect, useState } from "react";
import { VStack, Box, Stack, Grid, Spinner, Text } from "@chakra-ui/react";
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
  importERC1155
} from "../utils/contractCalls";

const { create } = require("ipfs-http-client");

export default function ImportNFTPage() {
  const { account, provider, factoryAddress, marketAddress } = useWeb3Context();
  const { fraktals, fraktions, nfts, balance } = useUserContext();

  const router = useRouter();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [noNFTs, setNoNFTs] = useState<boolean>(false);
  const [tokenMintedAddress, setTokenMintedAddress] = useState<string>("");
  const [fraktionalized, setFraktionalized] = useState<boolean>(false);

  async function importFraktalToMarket() {
    let index = 0;
    let isUsed = true;
    while (isUsed == true) {
      index += 1;
      isUsed = await getIndexUsed(index, provider, tokenMintedAddress);
    }
    if (isUsed == false) {
      await importFraktal(
        tokenMintedAddress,
        index,
        provider,
        marketAddress
      ).then(() => {
        setFraktionalized(true);
      });
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

  return (
    <>
      {isLoading && <Spinner size="xl" />}
      {nfts?.length >= 1 && (
        <>
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
          <Box sx={{width: `100%`}}>
            <Text sx={{textTransform: `uppercase`, opacity: `0.8`, fontWeight: `700`}}>Select an NFT from your wallet</Text>
          </Box>
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
                  <NFTImportCardOS
                    item={item}
                    CTAText={"Import to market"}
                    onClick={() => importFraktalToMarket(item)}
                  />
                ) : (
                  <NFTImportCardOS
                    item={item}
                    CTAText={"Import"}
                    onClick={() => importNFT(item)}
                  />
                )}
              </div>
            ))}
          </Grid>
        </>
      )}
      {noNFTs && (
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
    </>
  );
}
