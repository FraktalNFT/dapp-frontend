import { VStack, Text, Box } from "@chakra-ui/react";
import React, { ReactNode, useMemo } from "react";
import { useWeb3Context } from "../../contexts/Web3Context";
import { addChainToMetaMask } from "../../utils/helpers";
import Header from "../header";
import ChainWarning from '../chainWarning';

const Layout: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { providerChainId } = useWeb3Context();

  const isValid = useMemo(
    () => [4].includes(providerChainId),
    [providerChainId]
  );

  return (
    <>
      <Header />
      {!isValid &&
        <ChainWarning />
      }
      {children}
    </>
  );
};

export default Layout;
