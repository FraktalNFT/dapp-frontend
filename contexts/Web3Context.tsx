/**
 * React
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import WalletConnectProvider from "@walletconnect/web3-provider";
import { ethers } from "ethers";
import { provider } from "web3-core";
import Web3Modal, { IProviderOptions } from "web3modal";
import Web3 from "web3";
/**
 * Utils
 */
import {
  marketContracts,
  factoryContracts,
  airdropContract,
  lpStakingContracts,
  tradingRewardsContracts,
  feeSharingContracts,
  fraktalTokenContracts,
  lpTokenContracts,
  partnerAirdropContract
} from '@/utils/constants';

import { getRPCUrl } from "@/utils/helpers";

type Web3ContextType = {
  account: null | string;
  provider: null | ethers.providers.Web3Provider;
  providerChainId: null | number;
  factoryAddress: null | string;
  marketAddress: null | string;
  airdropAddress: null | string;
  lpStakingAddress: null | string;
  tradingRewardsAddress: null | string;
  feeSharingAddress: null | string;
  fraktalTokenAddress: null | string;
  lpTokenAddress: null | string;
  partnerAirdropAddress: null | string;
};

const Web3Context = createContext<
  Web3ContextType & { loading: boolean; connectWeb3: () => void }
>({
  account: null,
  provider: null,
  providerChainId: null,
  factoryAddress: null,
  marketAddress: null,
  airdropAddress: null,
  lpStakingAddress: null,
  tradingRewardsAddress: null,
  feeSharingAddress: null,
  fraktalTokenAddress: null,
  lpTokenAddress: null,
  loading: false,
  partnerAirdropAddress: null,
  connectWeb3: () => {},
});

export const useWeb3Context = () => useContext(Web3Context);

const providerOptions: IProviderOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      rpc: {
        1: getRPCUrl(1),
        3: getRPCUrl(3),
        4: getRPCUrl(4),
        5: getRPCUrl(5),
        42: getRPCUrl(42),
      },
    },
  },
};

const web3Modal =
  typeof window !== "undefined" &&
  new Web3Modal({
    cacheProvider: true,
    providerOptions,
  });

const Web3ContextProvider: React.FC = ({ children }) => {
  const [{ account, providerChainId, provider, marketAddress, factoryAddress, airdropAddress, lpStakingAddress, tradingRewardsAddress, feeSharingAddress, fraktalTokenAddress, lpTokenAddress, partnerAirdropAddress}, setWeb3State] =
    useState<Web3ContextType>({
      account: null,
      provider: null,
      providerChainId: null,
      factoryAddress: null,
      marketAddress: null,
      airdropAddress: null,
      lpStakingAddress: null,
      tradingRewardsAddress: null,
      feeSharingAddress: null,
      fraktalTokenAddress: null,
      lpTokenAddress: null,
      partnerAirdropAddress: null
    });

  const [loading, setLoading] = useState(true);

  const setProvider = useCallback(
    async (
      prov: provider & { chainId: string },
      initialCall: boolean = false
    ) => {
      try {
        setLoading(true);
        if (prov) {
          const provider = new ethers.providers.Web3Provider(
            new Web3(prov).currentProvider as ethers.providers.ExternalProvider
          );
          const chainId = parseInt(prov.chainId, 16);
          const marketChainAddress = marketContracts.find(x=>x.providerChainId === chainId).address; // contract specific providerChainId
          const factoryChainAddress = factoryContracts.find(x=>x.providerChainId === chainId).address; // contract specific providerChainId
          const airdropChainAddress = airdropContract.find(x=>x.providerChainId === chainId).address;
          const lpStakingChainAddress = lpStakingContracts.find(x=>x.providerChainId === chainId).address;
          const tradingRewardsChainAddress = tradingRewardsContracts.find(x=>x.providerChainId === chainId).address;
          const feeSharingChainAddress = feeSharingContracts.find(x=>x.providerChainId === chainId).address;
          const fraktalTokenChainAddress = fraktalTokenContracts.find(x=>x.providerChainId === chainId).address;
          const lpTokenChainAddress = lpTokenContracts.find(x=>x.providerChainId === chainId).address;
          const partnerAirdropChainAddress = partnerAirdropContract.find(x=>x.providerChainId === chainId).address;
          const account = initialCall
            ? await provider.getSigner().getAddress()
            : null;


          setWeb3State(webState => ({
            ...webState,
            providerChainId: chainId,
            provider,
            account: account || webState.account,
            marketAddress: marketChainAddress,
            factoryAddress: factoryChainAddress,
            airdropAddress: airdropChainAddress,
            lpStakingAddress: lpStakingChainAddress,
            tradingRewardsAddress: tradingRewardsChainAddress,
            feeSharingAddress: feeSharingChainAddress,
            fraktalTokenAddress: fraktalTokenChainAddress,
            lpTokenAddress: lpTokenChainAddress,
            partnerAirdropAddress: partnerAirdropChainAddress
          }));
        }
      } catch (err) {
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    },
    []
  );


  const connectWeb3 = useCallback(async () => {
    const modalProvider = await web3Modal.connect();
    await setProvider(modalProvider, true);
    modalProvider.on("chainChanged", () => setProvider(modalProvider));
    modalProvider.on("accountsChanged", async (newAcc: string[]) =>
      setWeb3State(prev => ({ ...prev, account: newAcc[0] }))
    );
  }, [setProvider]);

  useEffect(() => {
    if (window.ethereum) window.ethereum.autoRefreshOnNetworkChange = false;
    web3Modal.cachedProvider ? connectWeb3() : setLoading(false);
  }, []);

  return (
    <Web3Context.Provider
      value={{ account, providerChainId, provider, loading, connectWeb3, marketAddress, factoryAddress, airdropAddress, lpStakingAddress, tradingRewardsAddress, feeSharingAddress, fraktalTokenAddress, lpTokenAddress,partnerAirdropAddress }}
    >
      {children}
    </Web3Context.Provider>
  );
};
//
export default Web3ContextProvider;
