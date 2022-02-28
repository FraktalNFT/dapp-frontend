import Link from "next/link";
import { Text } from "@chakra-ui/react";
import { BigNumber, utils } from "ethers";
import FrakButton from "../../../components/button";
import styles from "./auction.module.css";
import { HStack, VStack, Box, Stack, Spinner } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import FraktionsList from "../../../components/fraktionsList";
import RevenuesList from "../../../components/revenuesList";
import UserOwnership from "../../../components/userOwnership";
import BuyOutCard from "../../../components/buyOutCard";
import FraktionOwners from "../../../components/fraktionOwners";
import { Image } from "@chakra-ui/image";
import { shortenHash, timezone } from "../../../utils/helpers";
import { getSubgraphData } from "../../../utils/graphQueries";
import { useWeb3Context } from "../../../contexts/Web3Context";
import {
  getBalanceFraktions,
  getMinimumOffer,
  unlistItem,
  getApproved,
  getFraktionsIndex,
  claimFraktalSold,
  isFraktalOwner,
} from "../../../utils/contractCalls";
import { useRouter } from "next/router";
import LoadScreen from '../../../components/load-screens';
import {EXPLORE} from "@/constants/routes";
import { fetchNftMetadata } from '../../../utils/nftHelpers'

const etherscanAddress = "https://rinkeby.etherscan.io/address/";

interface Revenue {
  id: string
  value: BigInt
  timestamp: BigInt
  creator: string
  tokenAddress: string
  buyout: boolean
}

interface FraktalNft {
  id: string
  marketId: BigInt
  hash: string
  creator: {
    id: string
  }
  collateral: string | null
  owner: string
  createdAt: BigInt
  transactionHash: string
  fraktions: []
  revenues: Revenue[]
  offers: []
  status: string
}

interface MetaData {
  name: string
  description: string
  image: string

}

export default function DetailsView() {
  const router = useRouter()
  const { account, provider, marketAddress, factoryAddress } = useWeb3Context()
  const [loading, setLoading] = useState(true)
  const [tokenAddress, setTokenAddress] = useState("")
  const [nft, setNft] = useState<FraktalNft>()
  const [meta, setMeta] = useState<MetaData>()

  const [minOffer, setMinOffer] = useState<BigNumber>(BigNumber.from(0));
  const [fraktionsListed, setFraktionsListed] = useState([]);
  const [userHasListed, setUserHasListed] = useState(false);
  const [fraktionsApproved, setFraktionsApproved] = useState(false);
  const [factoryApproved, setFactoryApproved] = useState(false);
  const [userFraktions, setUserFraktions] = useState(0);
  const [isOwner, setIsOwner] = useState(false);
  const [fraktionsIndex, setFraktionsIndex] = useState();
  
  useEffect(() => {
    // Component will get tokenAddress on second pass of useEffect
    if(router.query.id) {
      setTokenAddress(router.query.id.toString().toLowerCase())
    }
  })

  useEffect(() => {
    if(tokenAddress !== "") {
      setLoading(true)
      getAllData()
    }
  }, [tokenAddress])

  useEffect(() => {
    if(account && provider) {
      getContractData()
    }
  }, [account, provider])

  useEffect(() => {
    if(tokenAddress && account) {
      getFraktions()
    }
  }, [tokenAddress, account])
  
  useEffect(() => {
    if(tokenAddress && marketAddress && provider) {
      getOffers()
    }
  }, [tokenAddress, marketAddress, provider])

  const getAllData = async () => {
    await getFraktal()
    setLoading(false)
  }

  async function getFraktal() {
    let fraktionsFetch = await getSubgraphData("fraktions", tokenAddress)
    if (fraktionsFetch.listItems) {
      setFraktionsListed(fraktionsFetch.listItems);
    }

    const { fraktalNft } = await getSubgraphData("getFraktalByAddress", tokenAddress)
    setNft(fraktalNft)

    const meta = await fetchNftMetadata(fraktalNft.hash)
    setMeta(meta)
  }

  async function getFraktions() {
    let fraktionsFetch = await getSubgraphData("fraktions", tokenAddress)
    let userFraktionsListed = fraktionsFetch?.listItems?.find(({seller}) => 
      seller.id == account.toLowerCase()
    )

    setUserHasListed((userFraktionsListed && userFraktionsListed?.amount > 0))
  }

  async function getContractData() {
    try {
      let userBalance = await getBalanceFraktions(account, provider, tokenAddress)
      let index = await getFraktionsIndex(provider, tokenAddress)
      let marketApproved = await getApproved(account, marketAddress, provider, tokenAddress);
      let factoryApproved = await getApproved(account, factoryAddress, provider, tokenAddress);
      let isOwner = await isFraktalOwner(account, provider, tokenAddress);
      setFraktionsIndex(index);
      setFraktionsApproved(marketApproved);
      setFactoryApproved(factoryApproved);
      setUserFraktions(userBalance);
      setIsOwner(isOwner);
    } catch (err) {
      console.error(err);
    }
  }

  async function getOffers() {
    try {
      let minPrice: BigNumber = await getMinimumOffer(tokenAddress, provider, marketAddress)
      setMinOffer(minPrice);
    } catch (err) {
      console.error('unable to retreive minimum offer');
    }
  }

  async function callUnlistItem() {
    let tx = await unlistItem(tokenAddress, provider, marketAddress);
    if (typeof tx !== undefined) {
      router.push("/my-nfts", null, {scroll: false});
    }
  }

  async function claimFraktal() {
    // this one goes to offersCard
    try {
      await claimFraktalSold(tokenAddress, provider, marketAddress);
    } catch (e) {
      console.error("There has been an error: ", e);
    }
  }

  return (
    <>
      {loading && (
        <>
          <Box sx={{ display: `grid`, width: `100%`, placeItems: `center` }}>
            <Spinner size="xl" />
          </Box>
        </>
      )}
      {!loading && (
        <Box
          sx={{
            display: `grid`,
            gridTemplateColumns: `400px 621px`,
            columnGap: `16px`,
          }}
        >
          <Box sx={{ position: `relative` }}>
            <VStack marginRight="53px" sx={{ position: `sticky`, top: `20px` }}>
              <Link href={EXPLORE}>
                <div className={styles.goBack}>← back to all NFTS</div>
              </Link>
              <Image
                src={meta.image}
                w="400px"
                h="400px"
                style={{ borderRadius: "4px 4px 0px 0px", objectFit: `cover` }}
              />
              <HStack justifyContent="space-between" marginTop="16px">
                <VStack>
                  <div
                    style={{
                      fontFamily: "Inter",
                      fontWeight: 600,
                      fontSize: "12px",
                      lineHeight: "14px",
                      letterSpacing: "1px",
                      color: "#A7A7A7",
                    }}
                  >
                    ARTIST
                  </div>
                  <div
                    style={{
                      fontFamily: "Inter",
                      fontWeight: 500,
                      fontSize: "16px",
                      lineHeight: "19px",
                    }}
                  >
                    <Text
                      sx={{ color: `hsla(224, 86%, 51%, 1)` }}
                      _hover={{ cursor: `pointer` }}
                      onClick={() => router.push(`/artist/${nft.creator.id}`, null, {scroll: false})}
                    >
                      {shortenHash(nft.creator.id)}
                    </Text>
                  </div>
                </VStack>
                <VStack>
                  <div
                    style={{
                      fontFamily: "Inter",
                      fontWeight: 600,
                      fontSize: "12px",
                      lineHeight: "14px",
                      letterSpacing: "1px",
                      color: "#A7A7A7",
                    }}
                  >
                    DATE OF CREATION
                  </div>
                  <div
                    style={{
                      fontFamily: "Inter",
                      fontWeight: 500,
                      fontSize: "16px",
                      lineHeight: "19px",
                    }}
                  >
                    {timezone(nft.createdAt)}
                  </div>
                </VStack>
              </HStack>
              <HStack>
              <VStack>
              <div
                    style={{
                      fontFamily: "Inter",
                      fontWeight: 600,
                      fontSize: "12px",
                      lineHeight: "14px",
                      letterSpacing: "1px",
                      color: "#A7A7A7",
                    }}
                  >
                    NFT Contract Address
                  </div>
                  <div
                    style={{
                      fontFamily: "Inter",
                      fontWeight: 500,
                      fontSize: "16px",
                      lineHeight: "19px",
                    }}
                  >
                    <a href={etherscanAddress+nft.id+"/"}>{shortenHash(nft.id)}</a>
                  </div>
              </VStack>
              </HStack>
              {/* for the defrak bug, i leave this function to claim the fraktal
          <button onClick={()=>claimFraktal()}>Claim</button>
          */}
              <UserOwnership
                fraktions={userFraktions}
                isFraktalOwner={isOwner}
                collateral={nft.collateral}
                isApproved={fraktionsApproved}
                marketAddress={marketAddress}
                tokenAddress={tokenAddress}
                marketId={nft.marketId}
                factoryAddress={factoryAddress}
                provider={provider}
                factoryApproved={factoryApproved}
              />
              <div style={{ marginTop: "21px" }}>
                {userHasListed && (
                  <FrakButton onClick={() => callUnlistItem()}>
                    Unlist Fraktions
                  </FrakButton>
                )}
                {!userHasListed && (
                  <FrakButton
                    disabled={fraktionsIndex == 0 || userFraktions < 1}
                    onClick={() =>
                      router.push(`/nft/${nft.marketId}/list-item`, null, {scroll: false})
                    }
                  >
                    List Fraktions
                  </FrakButton>
                )}
              </div>
            </VStack>
          </Box>
          <Stack spacing="0" mb="12.8rem">
            <div
              style={{
                fontSize: "48px",
                fontFamily: "Inter",
                fontWeight: 800,
                lineHeight: "64px",
              }}
            >
              {meta.name}
            </div>
            <div
              style={{
                fontSize: "16px",
                fontFamily: "Inter",
                fontWeight: 400,
                lineHeight: "22px",
                marginBottom: "40px",
              }}
            >
              {meta.description}
            </div>
            {nft.status == "open" ? (
              <FraktionsList
                fraktionsListed={fraktionsListed}
                tokenAddress={tokenAddress}
                marketAddress={marketAddress}
                provider={provider}
              />
            ) : null}
            <div style={{ marginTop: "40px" }}>
              <BuyOutCard
                account={account}
                minPrice={minOffer}
                fraktionsBalance={userFraktions}
                fraktionsApproved={fraktionsApproved}
                investors={nft.fraktions.filter(({amount}) => BigNumber.from(amount).gt(0)).length}
                offers={nft.offers}
                tokenAddress={tokenAddress}
                marketAddress={marketAddress}
                provider={provider}
                itemStatus={nft.status}
              />
            </div>
            <div style={{ marginTop: "40px" }}>
              <RevenuesList
                account={account}
                revenuesCreated={nft.revenues.filter(x => x.value)}
                tokenAddress={tokenAddress}
                marketAddress={marketAddress}
              />
            </div>
            <div style={{ marginTop: "40px" }}>
              <FraktionOwners data={nft.fraktions} nftObject={nft} />
            </div>
          </Stack>
        </Box>
      )}
    </>
  );
}
