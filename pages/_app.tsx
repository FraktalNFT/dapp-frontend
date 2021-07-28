import { Box, ChakraProvider, extendTheme, VStack } from "@chakra-ui/react";
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import Header from "../components/header";
import Footer from "../components/footer";

import "../styles/globals.css";
import "../styles/fonts.css";
import Web3ContextProvider from "../contexts/Web3Context";
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
const APIURL = 'https://api.studio.thegraph.com/query/101/fraktalgoerli/v0.0.1';
const client = new ApolloClient({  uri: APIURL,  cache: new InMemoryCache()});

// const httpLink = createHttpLink({
//   uri: 'https://api.thegraph.com/studio/subgraph/fraktalgoerli/',
// });
//
// const authLink = setContext((_, { headers }) => {
//   // get the authentication token from local storage if it exists
//   const token = localStorage.getItem('token');
//   // return the headers to the context so httpLink can read them
//   return {
//     headers: {
//       ...headers,
//       authorization: token ? `Bearer ${token}` : "",
//     }
//   }
// });
function MyApp({ Component, pageProps }) {
  return (
    <ChakraProvider theme={customTheme}>
      <ApolloProvider client={client}>
        <Web3ContextProvider>
          <Layout>
            <VStack maxW='96.4rem' mx='auto' pt='6.4rem' flex={1} id='app'>
              <Component {...pageProps} />
            </VStack>
            <Footer />
          </Layout>
        </Web3ContextProvider>
      </ApolloProvider>
    </ChakraProvider>
  );
}

export default MyApp;
