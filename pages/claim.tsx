/**
 * React
 */
 import { useEffect, useState } from "react";
 /**
  * Chakra
  */
 
 import {
   VStack,
   Box,
   Grid,
   Spinner,
   Text,
   TabPanel,
   TabPanels,
   TabList,
   Tab,
   Tabs,
   Input, 
   Button,
   Stack
 } from "@chakra-ui/react";
 import { useRouter } from "next/router";
 import { claimAirdrop } from "../utils/contractCalls";
 import { airdropContract } from "@/utils/constants"; 
 /**
  * Contexts
  */
 
 import { useWeb3Context } from "../contexts/Web3Context";
 import { useUserContext } from "../contexts/userContext";
 import ListCard from "../components/listCard";
 /**
  * Contracts
  */
 
 import {
   createNFT,
   approveMarket,
   importFraktal,
   getIndexUsed,
   listItem,
   getApproved,
   importERC721,
   importERC1155,
   listItemAuction,
 } from "../utils/contractCalls";
 import { utils } from "ethers";
 /**
  * Components
  */
 
 import FrakButton4 from "@/components/button4";
 import NFTImportCardOS from "@/components/nft-importcard-opensea";
 import ListCardAuction from "@/components/listCardAuction";
 import toast from "react-hot-toast";
 /**
  * Redux
  */
 import store from "../redux/store";
 import {APPROVE_TOKEN, IMPORT_FRAKTAL, IMPORT_NFT, LISTING_NFT, rejectContract} from "../redux/actions/contractActions";
 import LoadScreen from '../components/load-screens';
 import styles from "../styles/mint-nft.module.css";
 import NFTCard from "@/components/nftCard";
 import {getAddressAirdrop} from "@/utils/graphQueries"
 
 /**
  * Constants
  */
 import {CREATE_NFT, MY_NFTS} from "@/constants/routes";
import { Workflow } from "types/workflow";
 const { create } = require("ipfs-http-client");
 const MAX_FRACTIONS = 10000;

 const actionOpts = { workflow: Workflow.IMPORT_NFT }

 interface AirdropData{
     airdrop:{
         amount:string;
         proof: Array<string>;
     }
 }
 
 export default function ImportNFTPage() {
   const { account, provider, factoryAddress, marketAddress } = useWeb3Context();
   const { fraktals, fraktions, nfts, balance } = useUserContext();

   const [canClaim,setCanClaim] = useState<Boolean>(false);
   const [airdropAmount,setAirdropAmount] = useState<string>("0");
   const [proof,setProof] = useState<Array<string>>(null);
   const [addressInput,setAddressInput] = useState<string>(account);
   const [buttonLoading,setButtonLoading] = useState<Boolean>(false);
   const [airdropStatus,setAirdropStatus] = useState<string>("");
   const [listedTokenAddress,setListedTokenAddress] = useState<string>("");

 
   const router = useRouter();
   const checkAddress = () => {
    setButtonLoading(true);
    getAddressAirdrop(addressInput).then((res:AirdropData)=>{
        setButtonLoading(false);
        if(res.airdrop){
            console.log(res.airdrop.amount);
            const airdropAmount = utils.formatEther(res.airdrop.amount)
            setAirdropStatus("Eligible!! "+parseTier(Number(airdropAmount))+" FRAK");
            setCanClaim(true);
            setAirdropAmount(res.airdrop.amount);
            setProof(res.airdrop.proof);
        }else{
            setAirdropStatus("Not eligible..");
            setCanClaim(false);
        }
     })
   }

   function parseTier(amount){
       console.log(amount);
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

    async function claim(){
        console.log(airdropContract);
        console.log(airdropAmount);
        console.log((utils.parseEther(airdropAmount)).toString());
        
        await claimAirdrop(airdropAmount,proof,listedTokenAddress,provider,airdropContract[1].address);
    }
 
   return (
     <div>
        <Stack direction={"row"} width={400} >
            <Input placeholder='Address' value={addressInput} onChange={(e)=> setAddressInput(e.target.value)} />
            <Button colorScheme='blue'onClick={checkAddress} isLoading={buttonLoading} >Check</Button>
        </Stack>
        {airdropStatus}

        {canClaim && <Stack direction={"row"}>
        
            <Input placeholder='Listed token address' value={listedTokenAddress} onChange={(e)=> setAddressInput(e.target.value)} />
            <Button colorScheme='green' onClick={claim} >Claim now!</Button>
        </Stack>}
     </div>
   );
 }
 
