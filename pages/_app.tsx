import { ChakraProvider, extendTheme, VStack } from "@chakra-ui/react";
import Footer from "../components/footer";
import "../styles/globals.css";
import "../styles/fonts.css";
import Web3ContextProvider from "../contexts/Web3Context";
import UserContextProvider from "../contexts/userContext";
import { MintingFC } from "@/contexts/NFTIsMintingContext";
import Layout from "../components/layout";

const customTheme = extendTheme({
  colors: {
    white: {
      100: "#E0E0E0",
      500: "#F9F9F9",
      900: "#fff",
    },
    black: {
      500: "#656464",
      900: "#000",
    },
    red: {
      900: "#FF0000",
    },
  },
});

function MyApp({ Component, pageProps }) {
  return (
    <ChakraProvider theme={customTheme}>
      <Web3ContextProvider>
        <UserContextProvider>
          <MintingFC>
            <Layout>
              <VStack maxW='96.4rem' mx='auto' pt='6.4rem' flex={1} id='app'>
                <Component {...pageProps} />
              </VStack>
              <Footer />
            </Layout>
          </MintingFC>
        </UserContextProvider>
      </Web3ContextProvider>
    </ChakraProvider>
  );
}

export default MyApp;
