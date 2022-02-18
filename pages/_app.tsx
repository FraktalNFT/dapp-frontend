/**
 * Chakra
 */
import { ChakraProvider, extendTheme, VStack } from "@chakra-ui/react";
/**
 * Styles
 */
import "../styles/globals.css";
import "../styles/fonts.css";
/**
 * Contexts
 */
import Web3ContextProvider from "@/contexts/Web3Context"
import { UserContextProviderFC } from "@/contexts/userContext";
import { MintingFC } from "@/contexts/NFTIsMintingContext";
/**
 * App Fraktal Components
 */
import Layout from "../components/layout";
import Footer from "../components/footer";
/**
 * Redux
 */
import { Provider } from 'react-redux'
import store from '../redux/store';
/**
 * Toaster
 */
import { Toaster } from "react-hot-toast";

/**
 *  Theme
 */
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

/**
 * My APP
 * @param {any} Component
 * @param {any} pageProps
 * @returns {any}
 * @constructor
 */
function MyApp({ Component, pageProps }) {
  return (
    <ChakraProvider theme={customTheme} >
      <Provider store={store}>
      <Web3ContextProvider>
        <UserContextProviderFC>
          <MintingFC>
            <Layout>
              <VStack maxW="96.4rem" mx="auto" pt="6.4rem" flex={1} id="app">
                <Component {...pageProps} />
              </VStack>
              <Footer />
              <Toaster />
            </Layout>
          </MintingFC>
        </UserContextProviderFC>
      </Web3ContextProvider>
      </Provider>
    </ChakraProvider>
  );
}

export default MyApp;
