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
  fraktions: null | any[];
  nfts: null | any[];
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
    fetchNFTs();
  },[account])

  const fetchNFTs = useCallback(
    async () => {
      try {
        setLoading(true);
        if (account) {
          let openseaAssets = await assetsInWallet(account);
          let fobjects = await getSubgraphData('wallet',account.toLocaleLowerCase())
          let nftsERC721_wallet;
          let nftsERC1155_wallet;
          let totalNFTs = [];
          let fraktionsObjects;
          if(fobjects && fobjects.users.length){
            let userBalance = fobjects.users[0].balance
            let userBalanceFormatted = parseFloat(userBalance)/10**18;
            let validFraktions = fobjects.users[0].fraktions.filter(x=>{return x.status != 'retrieved'})
            fraktionsObjects = await Promise.all(validFraktions.map(x=>{return createObject(x)}))
            let fraktionsObjectsClean;
            if(fraktionsObjects){
              fraktionsObjectsClean = fraktionsObjects.filter(x=>{return x != null});
          }
          if(openseaAssets && openseaAssets.assets && openseaAssets.assets.length){
              nftsERC721_wallet = openseaAssets.assets.filter(x=>{return x.asset_contract.schema_name == 'ERC721'})
              if(nftsERC721_wallet && nftsERC721_wallet.length){
                totalNFTs = totalNFTs.concat(nftsERC721_wallet);
              }
              nftsERC1155_wallet = openseaAssets.assets.filter(x=>{return x.asset_contract.schema_name == 'ERC1155'})// && x.token_id != '0'
              totalNFTs = nftsERC721_wallet.concat(nftsERC1155_wallet);
              let fraktalsClean;
              let totalAddresses;
              if(!fobjects || !fobjects.users[0] || !fobjects.users[0].fraktals){
                  totalAddresses = [];
              }else{
                let userFraktalsFetched = fobjects.users[0].fraktals;
                let userFraktalObjects = await Promise.all(userFraktalsFetched.map(x=>{return createObject2(x)}))
                if(userFraktalObjects){
                  fraktalsClean = userFraktalObjects.filter(x=>{return x != null && x.imageURL.length});
                }
                let userFraktalAddresses = fraktalsClean.map(x => {return x.id});
                let userFraktionsAddreses = fraktionsObjects.map(x => {return x.id});
                totalAddresses = userFraktalAddresses.concat(userFraktionsAddreses);
              }
              let nftsFiltered = totalNFTs.map(x=>{
                if(!totalAddresses.includes(x.asset_contract.address)){
                  return x
                }
              })
              let nftObjects = await Promise.all(nftsFiltered.map(x=>{return createOpenSeaObject(x)}))
              let nftObjectsClean;
              if(nftObjects){
                nftObjectsClean = nftObjects.filter(x=>{return x != null && x.imageURL.length});
              }
              setUserState(userState => ({
                ...userState,
                fraktals: fraktalsClean,
                fraktions: fraktionsObjectsClean,
                nfts: nftObjectsClean,
                balance: userBalanceFormatted
              }));
          }
          // luego adaptar las necesidades de la dapp
          // actualizar en los cambios de estado
          // detectar cambios de usuario y refresh
        }
        }
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
