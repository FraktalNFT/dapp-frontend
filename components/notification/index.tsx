import React from "react";
import Link from "next/link";
import { Flex, Box, Text, Button, Link as ChakraLink } from "@chakra-ui/react";

import AnimatedBall from "../animatedBall";
import AnimateClosed from "../animateClosed";
import AnimateSuccess from "../animateSuccess";

const loadingContent = {
  title: "Minting NFT",
  content:
    "Please wait a few moments while your transaction is processed by Arbitrum",
  transactionStatus: "View Transaction",
  button: {
    textColor: "#7B62AB",
    bgColor: "#a686bd49",
    content: "Pending",
  },
};

const successContent = {
  title: "Minting NFT",
  content:
    "Congrats! Your transaction has successfully been processed on Arbitrum.",
  transactionStatus: "Transaction Completed",
  button: {
    textColor: "#22BBB2",
    bgColor: "#91cfa675",
    content: "View NFT",
  },
};
const errorContent = {
  title: "Minting NFT",
  content: "User Denied Metamask Signature",
  transactionStatus: null,
  button: {
    textColor: "#6C7FBF",
    bgColor: "#90D5DE75",
    content: "Try Again",
  },
};

const index = () => {
  const [transaction, setTransaction] = React.useState(loadingContent);

  React.useEffect(() => {
    let timer1 = setTimeout(() => setTransaction(successContent), 5 * 1000);

    return () => {
      clearTimeout(timer1);
    };
  }, []);

  React.useEffect(() => {
    let timer1 = setTimeout(() => setTransaction(errorContent), 10 * 1000);

    return () => {
      clearTimeout(timer1);
    };
  }, []);

  return (
    <Flex
      w="400px"
      h="437px"
      direction="column"
      bg="#fff"
      justify="center"
      align="center"
      borderRadius="15px"
      boxShadow="0px 7px 20px rgba(0, 0, 0, 0.35)"
    >
      <Box
        d="flex"
        justifyContent="center"
        alignItems="center"
        gridGap="7px"
        w="60px"
        height="60px"
        borderRadius="50%"
        background="#6c7fbf28"
      >
        <AnimatedBall color="#7A61AA" delay={0.3} />
        <AnimatedBall color="#90D5DE" delay={0.7} />
        <AnimatedBall color="#22BCB3" delay={0.5} />
        {/* <AnimateSuccess /> */}
        {/* <AnimateClosed /> */}
      </Box>

      <Box align="center" m="43px 0 21px">
        <Text
          fontWeight="bold"
          fontSize="17px"
          lineHeight="20px"
          color="#525252"
        >
          {transaction.title}
        </Text>
        <Text
          maxW="210px"
          fontWeight="500"
          fontSize={transaction.transactionStatus ? "15px" : "20px"}
          lineHeight="18px"
          color={transaction.transactionStatus ? "#969696" : "#FF2323"}
          m="9px 0 12px"
        >
          {transaction.content}
        </Text>

        <Link href="/hi">
          <ChakraLink
            isExternal
            fontSize="15px"
            lineHeight="18px"
            color="#22BBB2"
            textDecoration="underline !important"
            _hover={{}}
          >
            {transaction.transactionStatus}
          </ChakraLink>
        </Link>
        <Text></Text>
      </Box>
      <Button
        variant="unstyled"
        width="100px"
        height="36px"
        background={transaction.button.bgColor}
        borderRadius="50px"
        fontWeight="500"
        fontSize="15px"
        lineHeight="18px"
        color={transaction.button.textColor}
      >
        {transaction.button.content}
      </Button>
    </Flex>
  );
};

export default index;