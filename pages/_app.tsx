import { ChakraProvider, extendTheme, VStack } from "@chakra-ui/react";
import Header from "../components/header";
import Footer from "../components/footer";

import "../styles/globals.css";
import "../styles/fonts.css";

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
      <Header />
      <VStack pt="6.4rem" flex={1}>
        <Component {...pageProps} />
      </VStack>
      <Footer />
    </ChakraProvider>
  );
}

export default MyApp;
