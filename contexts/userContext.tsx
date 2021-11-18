import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useWeb3Context } from './Web3Context';
import { assetsInWallet } from '../utils/openSeaAPI';
import { getSubgraphData } from '../utils/graphQueries';
import { createObject, createObject2, createOpenSeaObject } from '../utils/nftHelpers';

type UserContextType = {
  fraktals: null | any[];
  fraktions: null | undefined |  any[];
  nfts: null | undefined | any[];
  balance: number;
};

const UserContext = createContext<
  UserContextType & { loading: boolean; fetchNFTs: () => void }
>({
  fraktals: null,
  fraktions: null,
  nfts: null,
  balance: 0,
  loading: false,
  fetchNFTs: () => {},
});

export const useUserContext = () => useContext(UserContext);

const UserContextProvider: React.FC = ({ children }) => {
  const [{ fraktals, fraktions, nfts, balance }, setUserState] =
    useState<UserContextType>({
      fraktals: null,
      fraktions: null,
      nfts: null,
      balance: 0,
    });

  const [loading, setLoading] = useState(true);

  const { account } = useWeb3Context();

  useEffect(() => {
    if (account) {
      fetchNFTs()
    }
  },[account])

  const fetchNFTs = useCallback(
    // if user not in subgraph, fails to complete and show other nfts !!
    async () => {
      try {
        setLoading(true);
        let totalNFTs = [];
        let nftsERC721_wallet;
        let nftsERC1155_wallet;
        let fraktionsObjects;
        let fraktionsObjectsClean;
        let userBalanceFormatted;
        let fraktalsClean: null | any[];
        let totalAddresses: null | string[];
        let nftObjectsClean;

        let openseaAssets = await assetsInWallet(account);
        let fobjects = await getSubgraphData('wallet',account.toLocaleLowerCase())

        if(fobjects && fobjects.users.length){
          // balance retrieval
          let userBalance = fobjects.users[0].balance
          userBalanceFormatted = parseFloat(userBalance)/10**18;
          // Fraktions retrieval
          let validFraktions = fobjects.users[0].fraktions.filter(x=>{return x.status != 'retrieved'})
          fraktionsObjects = await Promise.all(validFraktions.map(x=>{return createObject(x)}))
          if(fraktionsObjects){
            fraktionsObjectsClean = fraktionsObjects.filter(x=>{return x != null});
          }
          // Fraktals retrieval
          let userFraktalsFetched = fobjects.users[0].fraktals;
          let userFraktalObjects = await Promise.all(userFraktalsFetched.map(x=>{return createObject2(x)}))
          if(userFraktalObjects){
            fraktalsClean = userFraktalObjects.filter(x=>{return x != null && x.imageURL.length && x.status != 'retrieved'});
          }
          let userFraktalAddresses = fraktalsClean.map(x => {return x.id});
          let userFraktionsAddreses = fraktionsObjects.map(x => {return x.id});
          totalAddresses = userFraktalAddresses.concat(userFraktionsAddreses);
        }
        if(openseaAssets && openseaAssets.assets && openseaAssets.assets.length){
          nftsERC721_wallet = openseaAssets.assets.filter(x=>{return x.asset_contract.schema_name == 'ERC721'})
          if(nftsERC721_wallet && nftsERC721_wallet.length){
            totalNFTs = totalNFTs.concat(nftsERC721_wallet);
          }
          nftsERC1155_wallet = openseaAssets.assets.filter(x=>{return x.asset_contract.schema_name == 'ERC1155'})
          totalNFTs = nftsERC721_wallet.concat(nftsERC1155_wallet);
          if(!fobjects || !fobjects.users[0] || !fobjects.users[0].fraktals){
              totalAddresses = [];
          }
          // NFTs filtering
          let nftsFiltered = totalNFTs.map(x=>{
            if(!totalAddresses.includes(x.asset_contract.address)){
              return x
            }
          })
          let nftObjects = await Promise.all(nftsFiltered.map(x=>{return createOpenSeaObject(x)}))
          if(nftObjects){
            nftObjectsClean = nftObjects.filter(x => {return x != null && x.imageURL.length});
          } else {
            nftObjectsClean = nftObjects;
          }
          setUserState(userState => ({
            ...userState,
            fraktals: fraktalsClean,
            fraktions: fraktionsObjectsClean,
            nfts: nftObjectsClean,
            balance: userBalanceFormatted
          }));
        }
        //TODO: detect account and states change > refresh
      } catch (err) {
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    },
    [account]
  );

  return (
    <UserContext.Provider
      value={{ fraktals, fraktions, nfts, balance, loading, fetchNFTs }}
    >
      {children}
    </UserContext.Provider>
  );
};
//
export default UserContextProvider;
