import Link from "next/link";
import { Text } from "@chakra-ui/react";
import { BigNumber, utils } from "ethers";
import FrakButton from "../../../components/button";
import styles from "./auction.module.css";
import { HStack, VStack, Box, Stack, Spinner, useToast } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import FraktionsList from "../../../components/fraktionsList";
import RevenuesList from "../../../components/revenuesList";
import UserOwnership from "../../../components/userOwnership";
import BuyOutCard from "../../../components/buyOutCard";
import FraktionOwners from "../../../components/fraktionOwners";
import { Image } from "@chakra-ui/image";
import {getExplorerUrl, shortenHash, timezone} from "../../../utils/helpers";
import { getSubgraphData,getAddressAirdrop } from "../../../utils/graphQueries";
import { createObject2 } from "../../../utils/nftHelpers";
import { useWeb3Context } from "../../../contexts/Web3Context";
import AirdropBanner from '../../../components/airdropBanner';
import {
  getBalanceFraktions,
  getMinimumOffer,
  unlistItem,
  getApproved,
  getFraktionsIndex,
  claimFraktalSold,
  isFraktalOwner,
  claimAirdrop,
} from "../../../utils/contractCalls";
import { useRouter } from "next/router";
import LoadScreen from '../../../components/load-screens';
import {EXPLORE} from "@/constants/routes";
// import { CONNECT_BUTTON_CLASSNAME } from "web3modal";
// import Modal from '../../../components/modal';


export default function DetailsView() {
  const router = useRouter();
  const { account, provider, marketAddress, factoryAddress,airdropAddress } = useWeb3Context();
  const [offers, setOffers] = useState();
  const [minOffer, setMinOffer] = useState<BigNumber>(BigNumber.from(0));
  const [nftObject, setNftObject] = useState({});
  const [tokenAddress, setTokenAddress] = useState<string>("");
  const [fraktionsListed, setFraktionsListed] = useState([]);
  const [userHasListed, setUserHasListed] = useState(false);
  const [collateralNft, setCollateralNft] = useState();
  const [fraktionsApproved, setFraktionsApproved] = useState(false);
  const [factoryApproved, setFactoryApproved] = useState(false);
  const [userFraktions, setUserFraktions] = useState(0);
  const [isOwner, setIsOwner] = useState(false);
  const [revenues, setRevenues] = useState();
  const [isPageReady, setIsPageReady] = useState<boolean>(false);
  // const [txInProgress, setTxInProgress] = useState(false);
  const [fraktionsIndex, setFraktionsIndex] = useState();
  const [args, setArgs] = useState([]);
  const [investors, setInvestors] = useState(0);
  // use callbacks

  const [isLoading, setIsLoading] = useState(true);
  const [airdropAmount,setAirdropAmount] = useState<string>("0");
  const [proof,setProof] = useState<Array<string>>(null);


  const airdropConnectToWalletId = 'connectToWallet';
  const listNFTToClaimId = 'listNFT';
  const claimToastId = 'claim';
  const learnToastId = 'learn';
  const notEligible = 'notEligible'

  useEffect(() => {
    if (router.isReady) {
      let pathname = router.asPath;
      let args = pathname.split("/");
      do {
        pathname = router.asPath;
        setArgs(pathname.split("/"));
        setIsPageReady(false);
      } while (args[2] === "[id]" || typeof args[2] === "undefined");
      // console.log('setting ready to true with:',args[2])
      setIsPageReady(true);
    }
  }, [router]);

  async function getFraktal() {
    const tokenAddress = args[2];
    const tokenAddressSplitted = tokenAddress.toLocaleLowerCase();
    setTokenAddress(tokenAddressSplitted);
    let fraktionsFetch = await getSubgraphData(
      "fraktions",
      tokenAddressSplitted
    );
    if (fraktionsFetch.listItems) {
      setFraktionsListed(fraktionsFetch.listItems);
    }
    let fraktalFetch = await getSubgraphData("fraktal", tokenAddressSplitted);
    if (
      fraktalFetch &&
      fraktalFetch.fraktalNfts &&
      fraktalFetch.fraktalNfts[0]
    ) {
      let nftObjects = await createObject2(fraktalFetch.fraktalNfts[0]);
      if (nftObjects) {
        let investorsWBalance = nftObjects.balances.filter(x => {
          return parseInt(x.amount) > 0;
        });
        // console.log('investors',investorsWBalance)
        setInvestors(investorsWBalance.length);
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

  async function getFraktions() {
    if (fraktionsListed && account && tokenAddress) {
      let fraktionsFetch = await getSubgraphData("fraktions", tokenAddress);
      let userFraktionsListed = fraktionsFetch?.listItems?.find(
        x => x.seller.id == account.toLocaleLowerCase()
      );
      if (userFraktionsListed && userFraktionsListed?.amount > 0) {
        setUserHasListed(true);
      }
    } else setUserHasListed(false);
  }

  async function getContractData() {
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
        console.error("Error:", e);
      }
    }
  }

  async function getOffers() {
    if (tokenAddress && marketAddress) {
      try {
        let minPrice:BigNumber = await getMinimumOffer(
          tokenAddress,
          provider,
          marketAddress
        );

        setMinOffer(minPrice);
      } catch (err) {
        console.error('unable to retreive minimum offer');
      }
    }
  }

  const getAirdrop = async (userAddress) =>{
    const data = await getAddressAirdrop(userAddress);
    if(data.airdrop!=null){
      setAirdropAmount(data.airdrop.amount);
      setProof(data.airdrop.proof);
    }
    return data;
  }

  const userClaimAirdrop = async () => {
    await claimAirdrop(airdropAmount,proof,window?.localStorage.getItem(`firstMinted-${account}`),provider,airdropAddress);
  }

  const toastClaimAirdrop = async () => {
    const listedToken = window?.localStorage.getItem(`firstMinted-${account}`);
    await getAirdrop(account);
    if((window?.localStorage.getItem('userClaimed') == null)
    && (listedToken != null)){
      toast.closeAll();
      const title = `Claim FRAK! *It make take up to 10 Minutes before you can claim.`;
      toast({
        id: claimToastId,
        position: 'top',
        duration: null,
        render: () => (
          <AirdropBanner
            icon="🙌"
            onClick={async () => {
              toast.close(claimToastId);
              await userClaimAirdrop();
              window?.localStorage.setItem('userClaimed', 'true');
              openLearnMore();
            }}
            buttonText={'Claim'}
            title={title}
          />
        ),
      });
    }
  }

  const openLearnMore = () => {
    if (
      toast.isActive(learnToastId) ||
      window?.localStorage.getItem('userReadDoc') == 'true'
    ) {
      return;
    }
    toast.closeAll();
    toast({
      id: learnToastId,
      position: 'top',
      duration: null,
      render: () => (
        <AirdropBanner
          icon="⛽️"
          onClick={() => {
            toast.close(learnToastId);
            window?.localStorage.setItem('userReadDoc', 'true');
            window.open(
              'https://docs.fraktal.io/fraktal-governance-token-frak/airdrop',
              '_blank'
            );
          }}
          buttonText={'Learn More'}
          title={'Earn FRAK to offset gas costs'}
        />
      ),
    });
  };

  const [fraktionsGot, setFraktionsGot] = useState(false);
  const [fraktalsGot, setFraktalsGot] = useState(false);
  const [offersGot, setOffersGot] = useState(false);
  const [contractDataGot, setContractDataGot] = useState(false);
  const toast = useToast();


  useEffect(() => {
    async function getAllData() {
      if (isPageReady) {
        if (!fraktionsGot) {
          await getFraktions();
          setFraktionsGot(true);
        }
        if (!fraktalsGot) {
          await getFraktal();
          setFraktalsGot(true);
        }
        if (!offersGot) {
          await getOffers();
          setOffersGot(true);
        }
        if (!contractDataGot) {
          await getContractData();
          setContractDataGot(true);
        }
        setIsLoading(false);
      }
    }
    getAllData();
  }, [
    isPageReady,
    account,
    provider,
    tokenAddress,
    fraktionsListed,
    nftObject,
    marketAddress,
  ]);

  useEffect(()=>{
    toastClaimAirdrop();
  },[])

  async function callUnlistItem() {
    let tx = await unlistItem(tokenAddress, provider, marketAddress);
    if (typeof tx !== "undefined") {
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
      {isLoading && (
        <>
          <Box sx={{ display: `grid`, width: `100%`, placeItems: `center` }}>
            <Spinner size="xl" />
          </Box>
        </>
      )}
      {!isLoading && (
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
                src={nftObject ? nftObject.imageURL : null}
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
                      onClick={() => router.push(`/artist/${nftObject.creator}`, null, {scroll: false})}
                    >
                      {nftObject ?
                        shortenHash(nftObject.creator)
                        :
                        "loading"
                      }
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
                    {nftObject ? timezone(nftObject.createdAt) : "loading"}
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
                    <a href={getExplorerUrl(parseInt(process.env.NEXT_PUBLIC_NETWORK_CHAIN_ID)) + 'address/' +nftObject.id+"/"}>{nftObject ? shortenHash(nftObject.id) : "loading"}</a>
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
                marketId={nftObject ? nftObject.marketId : null}
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
                      router.push(`/nft/${nftObject.marketId}/list-item`, null, {scroll: false})
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
              {nftObject ? nftObject.name : "Loading"}
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
              {nftObject && nftObject.description
                ? nftObject.description
                : null}
            </div>
            {nftObject && nftObject.status == "open" ? (
              <FraktionsList
                nftObject={nftObject}
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
                investors={investors}
                offers={offers}
                tokenAddress={tokenAddress}
                marketAddress={marketAddress}
                provider={provider}
                itemStatus={
                  nftObject && nftObject.status ? nftObject.status : null
                }
              />
            </div>
            <div style={{ marginTop: "40px" }}>
              <RevenuesList
                account={account}
                revenuesCreated={revenues}
                tokenAddress={tokenAddress}
                marketAddress={marketAddress}
              />
            </div>
            <div style={{ marginTop: "40px" }}>
              <FraktionOwners data={nftObject.balances} nftObject={nftObject} />
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
      )}
    </>
  );
}
