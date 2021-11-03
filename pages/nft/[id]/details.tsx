import Link from "next/link";
import { utils } from "ethers";
import FrakButton from "../../../components/button";
import styles from "./auction.module.css";
import { HStack, VStack, Box, Stack, Spinner, Heading } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import FraktionsList from "../../../components/fraktionsList";
import RevenuesList from "../../../components/revenuesList";
import UserOwnership from "../../../components/userOwnership";
import BuyOutCard from "../../../components/buyOutCard";
import FraktionOwners from "../../../components/fraktionOwners";
import { Image } from "@chakra-ui/image";
import { shortenHash, timezone, getParams } from "../../../utils/helpers";
import { getSubgraphData } from "../../../utils/graphQueries";
import { createObject2 } from "../../../utils/nftHelpers";
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
import { CONNECT_BUTTON_CLASSNAME } from "web3modal";
// import Modal from '../../../components/modal';

type nftObject = {
  balances: Array<Balance>;
  createdAt: string;
  creator: string;
  description: string;
  id: string;
  imageURL: string;
  marketId: string;
  name: string;
  status: string;
};

type Balance = {
  amount: string;
  locked: string;
};

export default function DetailsView() {
  const router = useRouter();
  const [fraktalOwners, setFraktalOwners] = useState(1);
  const [valueSetter, setValueSetter] = useState(false);
  const [isOfferer, setIsOfferer] = useState(false);
  const [itemSold, setItemSold] = useState(false);

  const { account, provider, marketAddress, factoryAddress } = useWeb3Context();
  const [offers, setOffers] = useState();
  const [minOffer, setMinOffer] = useState(0);
  const [nftObject, setNftObject] = useState<nftObject | undefined>(undefined);
  const [tokenAddress, setTokenAddress] = useState<string>("");
  const [fraktionsListed, setFraktionsListed] = useState([]);
  const [userHasListed, setUserHasListed] = useState(false);
  const [collateralNft, setCollateralNft] = useState();
  const [fraktionsApproved, setFraktionsApproved] = useState(false);
  const [factoryApproved, setFactoryApproved] = useState(false);
  const [fraktionsIndex, setFraktionsIndex] = useState();
  const [userFraktions, setUserFraktions] = useState(0);
  const [isOwner, setIsOwner] = useState(false);
  const [revenues, setRevenues] = useState();
  const [txInProgress, setTxInProgress] = useState(false);
  // use callbacks
  useEffect(() => {
    async function getData() {
      const pathname = window?.location.pathname;
      const params = pathname.split("/");
      setTokenAddress(params[2]);
      let fraktionsFetch = await getSubgraphData("fraktions", params[2]);
      if (fraktionsFetch.listItems) {
        setFraktionsListed(fraktionsFetch.listItems);
      }
      let fraktalFetch = await getSubgraphData("fraktal", params[2]);
      if (
        fraktalFetch &&
        fraktalFetch.fraktalNfts &&
        fraktalFetch.fraktalNfts[0]
      ) {
        let nftObjects = await createObject2(fraktalFetch?.fraktalNfts[0]);
        if (nftObjects) {
          setNftObject(nftObjects);
        }
        if (fraktalFetch.fraktalNfts[0].offers) {
          setOffers(fraktalFetch.fraktalNfts[0].offers);
        }
        if (fraktalFetch.fraktalNfts[0].collateral) {
          setCollateralNft(fraktalFetch.fraktalNfts[0].collateral);
        }
        let revenuesValid = fraktalFetch.fraktalNfts[0].revenues.filter(x => {
          return x.value > 0;
        });
        if (revenuesValid) {
          setRevenues(revenuesValid);
        }
      }
    }
    let attemptCounter = 0;
    while (typeof nftObject === "undefined" && attemptCounter < 10) {
      getData();
      attemptCounter++;
    }
  }, []);

  useEffect(() => {
    async function getData() {
      if (fraktionsListed && account && tokenAddress) {
        let fraktionsFetch = await getSubgraphData("fraktions", tokenAddress);
        let userFraktionsListed = fraktionsFetch?.listItems?.find(
          x => x?.seller?.id == account.toLocaleLowerCase()
        );
        if (userFraktionsListed && userFraktionsListed.amount > 0) {
          setUserHasListed(true);
        }
      } else setUserHasListed(false);
    }
    getData();
  }, [fraktionsListed, account, tokenAddress]);

  useEffect(() => {
    async function getData() {
      if (tokenAddress && account && provider) {
        try {
          let userBalance = await getBalanceFraktions(
            account,
            provider,
            tokenAddress
          );
          let index = await getFraktionsIndex(provider, tokenAddress);
          let marketApproved = await getApproved(
            account,
            marketAddress,
            provider,
            tokenAddress
          );
          let factoryApproved = await getApproved(
            account,
            factoryAddress,
            provider,
            tokenAddress
          );
          let isOwner = await isFraktalOwner(account, provider, tokenAddress);
          setFraktionsIndex(index);
          setFraktionsApproved(marketApproved);
          setFactoryApproved(factoryApproved);
          setUserFraktions(userBalance);
          setIsOwner(isOwner);
        } catch (e) {
          console.log("Error:", e);
        }
      }
    }
    getData();
  }, [account, provider, tokenAddress]);

  useEffect(() => {
    async function getData() {
      if (tokenAddress && marketAddress) {
        let minPriceParsed;
        try {
          let minPrice = await getMinimumOffer(
            tokenAddress,
            provider,
            marketAddress
          );
          minPriceParsed = utils.formatEther(minPrice);
        } catch {
          minPriceParsed = 0;
        }
        setMinOffer(minPriceParsed);
      }
    }
    getData();
  }, [nftObject, marketAddress]);

  async function callUnlistItem() {
    let tx = await unlistItem(tokenAddress, provider, marketAddress);
    if (typeof tx !== "undefined") {
      router.push("/my-nfts");
    }
  }

  async function claimFraktal() {
    // this one goes to offersCard
    try {
      await claimFraktalSold(tokenAddress, provider, marketAddress);
    } catch (e) {
      console.log("There has been an error: ", e);
    }
  }

  return (
    <Box
      sx={{
        display: `grid`,
        gridTemplateColumns: `400px 621px`,
        columnGap: `16px`,
      }}
    >
      <Box sx={{ position: `relative` }}>
        <VStack marginRight="53px" sx={{ position: `sticky`, top: `20px` }}>
          <Link href="/">
            <div className={styles.goBack}>← back to all NFTS</div>
          </Link>
          <Image
            src={nftObject ? nftObject?.imageURL : null}
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
                {nftObject ? (
                  shortenHash(nftObject?.creator)
                ) : (
                  <Box>
                    <Spinner size="md" speed="0.5s" />
                  </Box>
                )}
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
                {nftObject ? (
                  timezone(nftObject?.createdAt)
                ) : (
                  <Box>
                    <Spinner size="md" speed="0.5s" />
                  </Box>
                )}
              </div>
            </VStack>
          </HStack>
          {/* for the defrak bug, i leave this function to claim the fraktal
          <button onClick={()=>claimFraktal()}>Claim</button>
          */}
          <UserOwnership
            fraktions={userFraktions}
            isFraktalOwner={isOwner}
            collateral={collateralNft}
            isApproved={fraktionsApproved}
            marketAddress={marketAddress}
            tokenAddress={tokenAddress}
            marketId={nftObject ? nftObject?.marketId : null}
            factoryAddress={factoryAddress}
            provider={provider}
            factoryApproved={factoryApproved}
          />

          <div style={{ marginTop: "21px" }}>
            {userHasListed ? (
              <FrakButton onClick={() => callUnlistItem()}>
                Unlist Fraktions
              </FrakButton>
            ) : (
              <FrakButton
                disabled={fraktionsIndex != 0 && userFraktions < 1}
                onClick={() =>
                  router.push(`/nft/${nftObject.marketId}/list-item`)
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
          {nftObject ? (
            nftObject?.name
          ) : (
            <Box>
              <Heading>Loading</Heading>
              <Spinner size="xl" speed="0.5s" />
            </Box>
          )}
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
          {nftObject?.description ? nftObject?.description : null}
        </div>
        {nftObject && nftObject?.status == "open" ? (
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
            investors={nftObject?.balances ? nftObject?.balances.length : 0}
            offers={offers}
            tokenAddress={tokenAddress}
            marketAddress={marketAddress}
            provider={provider}
            itemStatus={nftObject?.status ? nftObject?.status : null}
          />
        </div>
        <div style={{ marginTop: "40px" }}>
          <RevenuesList
            account={account}
            revenuesCreated={revenues}
            tokenAddress={tokenAddress}
            marketAddress={marketAddress}
            provider={provider}
          />
        </div>
        <div style={{ marginTop: "40px" }}>
          <FraktionOwners data={[]} nftObject={nftObject} />
        </div>
      </Stack>
      {/*
      <Modal
        open={txInProgress}
        onClose={()=>setTxInProgress(false)}
      >
        Tx's in course!
      </Modal>
    */}
    </Box>
  );
}
