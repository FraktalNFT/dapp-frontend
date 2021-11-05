import { Box, Text, VStack } from "@chakra-ui/react";
import NextLink from "next/link";
import FrakButton from "../components/button";
import Image from "next/image";

const Custom404: React.FC = () => {
  return (
    <Box
      sx={{
        width: `1080px`,
        height: `410px`,
        display: `flex`,
        flexDirection: `column`,
        alignItems: `center`,
        justifyContent: `center`,
        backgroundColor: `#F9F9F9`,
        borderRadius: `24px`,
      }}
    >
      <Image src="/images/404_OhFrak.png" width="366px" height="130px" />
      <Box sx={{ minHeight: `24px` }}></Box>
      <Text
        sx={{
          fontFamily: `inter, sans-serif`,
          fontSize: `16px`,
          fontWeight: `500`,
          lineHeight: `24px`,
        }}
        mt=".8rem"
        textAlign="center"
      >
        Something went wrong
      </Text>
      <VStack mt="2.4rem" spacing="-1rem">
        <NextLink href="/">
          <FrakButton
            className="semi-16"
            _hover={{ backgroundColor: `rgba(0,0,0,0.95)` }}
          >
            Back to Marketplace
          </FrakButton>
        </NextLink>
      </VStack>
    </Box>
  );
};

export default Custom404;
