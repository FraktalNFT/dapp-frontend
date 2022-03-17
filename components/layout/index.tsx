/**
 * React
 */
import React, { ReactNode, useMemo, useState, useEffect } from 'react';
/**
 * Chakra UI
 */

import { Text, Box, useToast } from '@chakra-ui/react';
/**
 * NExt
 */
import { useRouter } from 'next/router';
/**
 * Context
 */
import { useWeb3Context } from '../../contexts/Web3Context';
/**
 * UTILS
 */
import { addChainToMetaMask } from '../../utils/helpers';
/**
 * Components
 */
import Header from '../header';
import ChainWarning from '../chainWarning';
import AirdropBanner from '../airdropBanner';

/**
 * ROUTES
 */
import { CREATE_NFT } from '@/constants/routes';
import { useUserContext } from '@/contexts/userContext';
import { claimAirdrop } from '@/utils/contractCalls';
import { getAddressAirdrop } from '@/utils/graphQueries';
import {utils} from 'ethers'

import LoadScreens from '../load-screens';

const Layout: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { providerChainId, connectWeb3, provider, airdropAddress, account } = useWeb3Context();
  const { walletAssets } = useUserContext();
  const router = useRouter();
  const toast = useToast();
  const [isMobile, setIsMobile] = useState(false);
  const [canClaim,setCanClaim] = useState<Boolean>(false);
  const [airdropAmount,setAirdropAmount] = useState<string>("0");
  const [proof,setProof] = useState<Array<string>>(null);

  const isValid = useMemo(
    () => [parseInt(process.env.NEXT_PUBLIC_NETWORK_CHAIN_ID)].includes(providerChainId),
    [providerChainId]
  );

  const airdropConnectToWalletId = 'connectToWallet';
  const listNFTToClaimId = 'listNFT';
  const claimToastId = 'claim';
  const learnToastId = 'learn';
  const notEligible = 'notEligible'

  useEffect(() => {
    const width = window?.innerWidth;
    const height = window?.innerHeight;
    if (height > width && width < 1280) {
      setIsMobile(true);
    }
  }, []);

  const getAirdrop = async (userAddress) =>{
    const data = await getAddressAirdrop(userAddress);
    if(data.airdrop!=null){
      setAirdropAmount(data.airdrop.amount);
      setProof(data.airdrop.proof);
    }
    return data;
  }

  const userClaimAirdrop = async (_amount,_proof) => {
    await claimAirdrop(_amount,_proof,window?.localStorage.getItem(`firstMinted-${account}`),provider,airdropAddress);
  }

  function parseTier(amount){
    switch(amount){
        case 10000:
            return "7900";
         case 4540:
             return "3160";
         case 2450:
             return "2370";
         case 1500:
             return "1580";
         case 2450:
             return "2370";
         case 1200:
             return "790";
         case 800:
             return "474";
         case 400:
             return "316";
         case 200:
             return "252";
         case 125:
             return "126";
    }
    return 0;
 }

  useEffect(() => {
    if (!isValid && !toast.isActive(airdropConnectToWalletId)) {
      const title = 'FRAKs airdrop is live';
      const subtitle = 'Connect your wallet to check if you are eligible.';

      toast.closeAll();
      toast({
        id: airdropConnectToWalletId,
        position: 'top',
        duration: null,
        render: () => (
          <AirdropBanner
            icon={'🔥'}
            buttonText={'Connect Wallet'}
            onClick={connectWeb3}
            title={title}
            subtitle={subtitle}
          />
        ),
      });
    } else {
      toast.closeAll();
      showAirdropBanners();
    }
  }, [isValid]);

  const showAirdropBanners = async () => {
    if (!isValid || window?.localStorage.getItem('userClaimed') == 'true') {
      return;
    }
    toast.closeAll();
    const listedToken = window?.localStorage.getItem(`firstMinted-${account}`);
    const airdropData = await getAirdrop(account);
    if(airdropData.airdrop==null && (window?.localStorage.getItem('userClaimed') == null)) {
      toast.closeAll();
      toast({
        id: notEligible,
        position: 'top',
        duration: null,
        render: () => (
          <AirdropBanner
            icon=""
            onClick={async () => {
              toast.closeAll();
              window?.localStorage.setItem('userClaimed', 'true');
              openLearnMore();
            }}
            buttonText={'Close'}
            title={"Not eligible to claim.."}
            subtitle={""}
          />
        ),
      });
    }
    else if (airdropData.airdrop!= null &&
      (window?.localStorage.getItem(`firstMinted-${account}`) == null
    )) {
      const eligibleFrak = parseTier(Number(utils.formatEther(airdropData.airdrop.amount)));
      const title = `Congrats, you have received ${eligibleFrak} FRAK`;
      const subtitle = 'List an NFT to claim.';
      toast.closeAll();
      toast({
        id: listNFTToClaimId,
        position: 'top',
        duration: null,
        render: () => (
          <AirdropBanner
            icon="🎁"
            onClick={async () => {
              router.push(CREATE_NFT, null, { scroll: false });
              toast.close(listNFTToClaimId);
            }}
            buttonText={'List NFT'}
            title={title}
            subtitle={subtitle}
          />
        ),
      });
    }
    else if (!toast.isActive(claimToastId)
    && (window?.localStorage.getItem('userClaimed') == null)
    && (listedToken != null)
    ) {

      const eligibleFrak = parseTier(Number(utils.formatEther(airdropData.airdrop.amount)));
      const title = `Claim ${eligibleFrak} FRAK. *Claiming Possible From 12:00 UTC`;

      toast({
        id: claimToastId,
        position: 'top',
        duration: null,
        render: () => (
          <AirdropBanner
            icon="🙌"
            onClick={async () => {
              toast.close(claimToastId);
              router.push("/claim", null, {scroll: false});
              await userClaimAirdrop(airdropData.airdrop.amount,airdropData.airdrop.proof);
              window?.localStorage.setItem('userClaimed', 'true');
              openLearnMore();
            }}
            buttonText={'Claim'}
            title={title}
          />
        ),
      });
    }
  };

  useEffect(() => {
    showAirdropBanners();
  }, [walletAssets]);

  const openLearnMore = () => {
    if (
      toast.isActive(learnToastId) ||
      window?.localStorage.getItem('userReadDoc') == 'true'
    ) {
      return;
    }
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
              'https://docs.fraktal.io/fraktal-governance-token-frak/trading-rewards',
              '_blank'
            );
          }}
          buttonText={'Learn More'}
          title={'Earn FRAK to offset gas costs'}
        />
      ),
    });
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
              padding: `1rem`,
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
            <Box
              sx={{
                display: `flex`,
                alignItems: `center`,
                justifyContent: `space-between`,
                width: `80%`,
                margin: `2rem`,
              }}
            >
              <a href="https://discord.gg/jF7PGKha" style={{ width: `15%` }}>
                <img src="/footer/discord.svg" style={{ width: `100%` }} />
              </a>
              <a href="https://medium.com/@fraktal" style={{ width: `20%` }}>
                <img src="/footer/medium.svg" style={{ width: `100%` }} />
              </a>
              <a href="https://twitter.com/fraktalnft" style={{ width: `15%` }}>
                <img src="/footer/twitter.svg" style={{ width: `100%` }} />
              </a>
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
      <LoadScreens />
    </>
  );
};

export default Layout;
