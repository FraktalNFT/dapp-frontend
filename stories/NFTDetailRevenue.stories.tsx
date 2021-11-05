import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { ChakraProvider, extendTheme, VStack } from "@chakra-ui/react";
import Footer from "../components/footer";
import "../styles/globals.css";
import "../styles/fonts.css";
import Web3ContextProvider from "../contexts/Web3Context";
import Layout from "../components/layout";

import RevenuesList from "../components/revenuesList";

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

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: "Components/NFT Detail Revenue",
  component: RevenuesList,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
    revenuesCreated: { type: "array" },
    tokenAddress: { type: "string" },
  },
} as ComponentMeta<typeof RevenuesList>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof RevenuesList> = args => (
  <ChakraProvider theme={customTheme}>
    <Web3ContextProvider>
      <Layout>
        <VStack maxW="96.4rem" mx="auto" pt="6.4rem" flex={1} id="app">
          <RevenuesList {...args} />
        </VStack>
        <Footer />
      </Layout>
    </Web3ContextProvider>
  </ChakraProvider>
);

export const Primary = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {
  revenuesCreated: [
    {
      buyout: "false",
      creator: { id: "0xbc4a2b0b65e39bae9bedad1798b824eaf0a60639" },
      id: "0x45bdd2a4ef0e8e4ff35ac81f2ff333a8ee8e9adc",
      timestamp: "1635966464",
      tokenAddress: "0x7e371bd4bb49c8c1fb1f25e104ccb233885779e8",
      value: "1000000000000000",
    },
  ],
  tokenAddress: "0x7e371bd4bb49c8c1fb1f25e104ccb233885779e8",
};
