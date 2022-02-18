/**
 * React
 */
import React, { ReactNode, useMemo, useState, useEffect } from "react";
/**
 * Chakra UI
 */

import { Text, Box, useToast} from "@chakra-ui/react";
/**
 * NExt
 */
import {useRouter} from "next/router";
/**
 * Context
 */
import { useWeb3Context } from "../../contexts/Web3Context";
/**
 * UTILS
 */
import { addChainToMetaMask } from "../../utils/helpers";
/**
 * Components
 */
import Header from "../header";
import ChainWarning from "../chainWarning";
import AirdropBanner from '../airdropBanner';

/**
 * ROUTES
 */
import {CREATE_NFT} from "@/constants/routes";
import {useUserContext} from "@/contexts/userContext";

const Layout: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { providerChainId, connectWeb3 } = useWeb3Context();
  const { walletAssets } = useUserContext();
  const router = useRouter();
  const toast = useToast();
  const [isMobile, setIsMobile] = useState(false);
  const isValid = useMemo(() => [4].includes(providerChainId), [
    providerChainId,
  ]);

  const airdropConnectToWalletId = 'connectToWallet';
  const listNFTToClaimId = 'listNFT';
  const claimToastId = 'claim';
  const learnToastId = 'learn';

  useEffect(() => {
    const width = window?.innerWidth;
    const height = window?.innerHeight;
    if (height > width && width < 1280) {
        setIsMobile(true);
    }
  }, []);

  useEffect(() => {
    if (!isValid && !toast.isActive(airdropConnectToWalletId)) {
        const title = 'FRAKs airdrop is live';
        const subtitle = 'Connect your wallet to check if you are eligible.';

        toast.closeAll();
        toast({
            id: airdropConnectToWalletId,
            position: "top",
            duration: null,
            render: () => (
                <AirdropBanner
                    icon={"🔥"}
                    buttonText={"Connect Wallet"}
                    onClick={connectWeb3}
                    title={title}
                    subtitle={subtitle}/> )
        })
    } else {
        toast.closeAll();
        showAirdropBanners();
    }

  }, [isValid]);

  const showAirdropBanners = () => {
      if (!isValid || window?.localStorage.getItem("userClaimed") == 'true') {
          return;
      }

      toast.closeAll();
      if (walletAssets == null || walletAssets.length == 0 && !toast.isActive(listNFTToClaimId)) {
          const title = 'Congrats, you have received 100 000 FRAK';
          const subtitle = 'List an NFT to claim.';
          toast({
              id: listNFTToClaimId,
              position: "top",
              duration: null,
              render: () => (
                  <AirdropBanner
                      icon="🎁"
                      onClick={() => {
                          router.push(CREATE_NFT);
                          toast.close(listNFTToClaimId);
                      }}
                      buttonText={"List NFT"}
                      title={title} subtitle={subtitle}/> )
          })
      } else if (!toast.isActive(claimToastId)) {
          toast({
              id: claimToastId,
              position: "top",
              duration: null,
              render: () => (
                  <AirdropBanner
                      icon="🙌"
                      onClick={() => {
                          toast.close(claimToastId);
                          window?.localStorage.setItem("userClaimed", 'true');
                          openLearnMore()}
                      }
                      buttonText={"Claim"}
                      title={"Claim 100 000 FRAK"}/> )
          })
      }

  };


  useEffect(() => {
    showAirdropBanners();
  }, [walletAssets]);

  const openLearnMore = () => {
      if (toast.isActive(learnToastId) || window?.localStorage.getItem("userReadDoc") == 'true') {
          return;
      }
      toast({
          id: learnToastId,
          position: "top",
          duration: null,
          render: () => (
              <AirdropBanner
                  icon="⛽️"
                  onClick={() => {
                      toast.close(learnToastId);
                      window?.localStorage.setItem("userReadDoc", "true");
                      window.open('https://docs.fraktal.io/fraktal-governance-token-frak/airdrop', '_blank');
                  }}
                  buttonText={"Learn More"}
                  title={"Earn FRAK to offset gas costs"}/> )
      })
  };


  return (
    <>
      {isMobile && (
        <>
          <Box
            sx={{
              width: `100%`,
              height: `100vh`,
              display: `flex`,
              flexDirection: `column`,
              alignItems: `center`,
              justifyContent: `space-between`,
              padding: `1rem`
            }}
          >
            <img src="/images/Logo.png" />
            <Box
              sx={{
                width: `80%`,
                backgroundColor: `#F9F9F9`,
                borderRadius: `12px`,
                display: `grid`,
                placeItems: `center`,
                height: `60vh`,
                padding: `1rem`,
              }}
            >
              <Text
                sx={{ color: `#B055FF`, fontSize: `2rem`, textAlign: `center` }}
              >
                Please switch to desktop while we work on our mobile experience.
              </Text>
            </Box>
            <Box sx={{display: `flex`, alignItems: `center`, justifyContent: `space-between`, width: `80%`, margin: `2rem`}}>
              <a href="https://discord.gg/jF7PGKha" style={{width: `15%`}}><img src="/footer/discord.svg" style={{width: `100%`}} /></a>
              <a href="https://medium.com/@fraktal" style={{width: `20%`}}><img src="/footer/medium.svg" style={{width: `100%`}} /></a>
              <a href="https://twitter.com/fraktalnft" style={{width: `15%`}}><img src="/footer/twitter.svg" style={{width: `100%`}} /></a>
            </Box>
          </Box>
        </>
      )}
      {!isMobile && (
        <>
          <Header />
          {!isValid && <ChainWarning />}
          {children}
        </>
      )}
    </>
  );
};


export default Layout;
