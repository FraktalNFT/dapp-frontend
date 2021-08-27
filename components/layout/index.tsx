import { VStack, Text, Box } from "@chakra-ui/react";
import React, { ReactNode, useMemo } from "react";
import { useWeb3Context } from "../../contexts/Web3Context";
import { addChainToMetaMask } from "../../utils/helpers";
import Header from "../header";

const Layout: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { providerChainId } = useWeb3Context();

  const isValid = useMemo(
    () => [null, 1, 4,5].includes(providerChainId),
    [providerChainId]
  );

  return (
    <>
      <Header />
      {isValid ? (
        children
      ) : (
        <VStack
          fontFamily='Inter'
          position='absolute'
          minW='50vw'
          minH='50vh'
          top='50%'
          left='50%'
          transform='translate(-50%, -50%)'
          boxShadow='0 0 1rem rgba(0, 0, 0, .3)'
          rounded='2xl'
          justifyContent='center'
          cursor='default'
          spacing='2rem'
        >
          <Text fontWeight='bold' fontSize='3.5rem'>
            Incorrect network
          </Text>
          <Box fontSize='2rem' textAlign='center'>
            Please select either{" "}
            <Text fontWeight='bold' as='span'>
              Ethereum Mainnet
            </Text>{" "}
            or{" "}
            <Text fontWeight='bold' as='span'>
              Goerli Testnet
            </Text>{" "}
          </Box>
        </VStack>
      )}
    </>
  );
};

export default Layout;
