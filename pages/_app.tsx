/**
 * Chakra
 */
import { ChakraProvider, ComponentStyleConfig, extendTheme, VStack } from "@chakra-ui/react";
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

const Text: ComponentStyleConfig = {
  variants: {
    footer: {
      color: "grey.500",
      fontSize: "1.6rem",
      fontWeight: "500",
      lineHeight: "4rem"
    }
  }
}

const Heading: ComponentStyleConfig = {
  variants: {
    footer: {
      fontSize: 14,
      fontWeight: 700,
      mb: [18, 18, "40px", "40px"]
    }
  }
}

/**
 *  Theme
 */
const customTheme = extendTheme({
  colors: {
    grey: {
      500: "#666b6d",
    },
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
  components: {
    Heading,
    Text,
  }
});

/**
 * App Performance Metrics
 * @see https://nextjs.org/docs/advanced-features/measuring-performance
 */
export function reportWebVitals(metric) {
  //console.log(metric);
}

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
              <VStack w="96.4rem" mx="auto" pt="6.4rem" flex={1} id="app">
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
