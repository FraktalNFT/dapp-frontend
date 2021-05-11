import { Box, Text, VStack, Image } from "@chakra-ui/react";
import NextLink from "next/link";
import FrakButton from "../components/button";

const Custom404: React.FC = () => {
  return (
    <Box>
      <Text className="semi-48">Oh, FRAK!</Text>
      <Text className="medium-16" mt=".8rem" textAlign="center">
        Something went wrong
      </Text>
      <VStack mt="2.4rem" spacing="-1rem">
        <NextLink href="/">
          <FrakButton className="semi-16">Back to Marketplace</FrakButton>
        </NextLink>
        <Image src="/doge.svg" />
      </VStack>
    </Box>
  );
};

export default Custom404;
