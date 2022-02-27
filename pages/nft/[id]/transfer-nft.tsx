import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useWeb3Context } from "@/contexts/Web3Context";
import { useUserContext } from "@/contexts/userContext";
import { Box, Flex, Input, Text, Image } from "@chakra-ui/react";
import FrakButton4 from "@/components/button4";
import styles from "../../../styles/my-nfts.module.css"

interface NFT {
  collateral: string;
  collateralType: null;
  createdAt: Date
  creator: string// "0x1df4d4fa3d513de5d6a4e95a5dccc8cbb02569b3"
  id: string,// "0x88b48f654c30e99bc2e4a1559b4dcf1ad93fa656"
  imageURL: string// "https://lh3.googleusercontent.com/NVwZ-gPp7hrGd49QwUwsfVaFGC-5U2pDdhp5ONYB01V5JKc3vovI83n8Uu-nu2lEhbyDX05M_dmLNQpJJ6mlT7GdAFjze_PE9YzDzks"
  marketId: string | number
  name: string
  tokenId: string // "13549653209390308151435410202515607127174271485949955940401382317821500850177"
  token_schema: "ERC1155" | "ERC721"
}

const TransferNFT = (): JSX.Element => {
  const router = useRouter();

  const { fraktals, fraktions, nfts, balance, loading } = useUserContext();
  const { account, provider, marketAddress, factoryAddress } = useWeb3Context();

  const [isPageReady, setIsPageReady] = useState<boolean>(false);

  const [transferNFT, setTransferNFT] = useState<NFT | null>(null);
  const [recipientAddress, setRecipientAddress] = useState<string>('...')


  useEffect(() => {
    if (router.isReady) {
      // query looks like this: https://www.testnet.fraktal.io/nft/[id]/transfer-nft
      const { id } = router.query;
      let nftToTransfer
      if(fraktals) {
        nftToTransfer = fraktals.find((item: NFT) => id === item.id)
      }
      setTransferNFT(nftToTransfer)      
      setIsPageReady(true);
    }
  }, [router, fraktals]);


  return (<>
    <Flex w="100%" 
      flexDir="column"
      align="center">
    <Box 
     display="flex"
     flexDir="column"
     maxWidth="95%"
     margin="40px"
     width="600px"
    >

    <Box className={styles.header} marginBottom="16px" display="flex" alignItems="center" justifyContent="center">Transfer</Box>
      {transferNFT && transferNFT.imageURL && (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          maxWidth="250px"
          width="100%"
          marginTop="8px"
          marginBottom="40px"
          padding="12px"
          borderRadius="10px"
          border="1px solid rgb(229, 232, 235)"
          boxShadow="rgb(4 17 29 / 25%) 0px 0px 8px 0px"
        >
          <Box
            display="flex"
            alignItems="center"
            maxWidth="100%"
            overflow="hidden"
            position="relative"
            borderRadius="inherit" 
            height="225px"
            width="225px"
          >
          <Image src={transferNFT.imageURL} alt='NFT Image' 
            objectFit="contain"
            width="auto" 
            height="auto"
            maxWidth="100%"
            maxHeight="100%"
            opacity="1"
            borderRadius="inherit"
          />
          </Box>
        </Box>
      </Box>
      )}

      <Box flexDir="column">
        <form>
          <Text className="semi-16" marginBottom="8px">Wallet address or ENS name</Text>
         <Box>
           <Input
              placeholder="e.g 0x1df4d4fa...or destination.eth"
              sx={{
                fontSize: `14px`,
                padding: `24px 16px`,
                margin: `1ex 0`,
                borderRadius: `24px`
              }}
              onChange={e => setRecipientAddress(e.target.value)}
            />
          </Box>
          <Box display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            marginTop="10px"
          >
            {transferNFT && transferNFT.name && (
              <Text fontSize="16px" marginBottom="8px" fontWeight="400" color="rgb(112, 122, 131)" isTruncated> <b>"{transferNFT.name}"</b> is about to be transfered to {recipientAddress}</Text>
            )}
            {recipientAddress !== "..." && recipientAddress && (
              <Text fontWeight="400" fontSize="13px" color="rgb(112, 122, 131)">&#9888;
              Items sent to the wrong address cannot be recovered</Text>
            )}
            <FrakButton4
             marginTop="8px"
             status={recipientAddress ? "Transfer" : ""}
             disabled={recipientAddress.length && recipientAddress!== "..." ? false: true}
             onClick={() => { }}
            >
             Transfer
            </FrakButton4>
          </Box>
        </form>
      </Box>
    </Box>
  </Flex>
  </>
  )
};

export default TransferNFT;
