import { Button } from "@chakra-ui/button";
import { Image } from "@chakra-ui/image";
import { Box, Center, StackProps, Text, VStack } from "@chakra-ui/layout";
import { formatEther } from "@ethersproject/units";
import React from "react";
import { FrakCard } from "../../types";
import FrakButton from "../button";

const NFTItem: React.FC<StackProps & { item: FrakCard; CTAText?: string }> = ({
  item,
  onClick,
  CTAText,
}) => {
  return (
    <VStack
      cursor="pointer"
      overflow="hidden"
      maxW="30rem"
      rounded="md"
      borderWidth="1px"
      borderColor="white.100"
      onClick={onClick}
    >
      <Box minH="30rem" w="100%" position="relative">
        <Image src={item.imageURL} width="100%" height="100%" />
        {item.countdown && (
          <VStack
            spacing="0"
            rounded="lg"
            background="black.900"
            position="absolute"
            alignItems="flex-end"
            top=".8rem"
            right=".8rem"
            py=".6rem"
            px=".8rem"
            color="white"
          >
            <Text className="medium-upper-12">Time Remaining</Text>
            <Text className="medium-16">11:59:09</Text>
          </VStack>
        )}

        {item.contributions && (
          <Center
            w="100%"
            position="absolute"
            bottom="0"
            background="rgba(0, 0, 0, .8)"
            py=".6rem"
          >
            <Text className="regular-14" color="white">
              {formatEther(item.contributions).toString()} Contributed
            </Text>
          </Center>
        )}
      </Box>
      <Center flexDirection="column" py="1.6rem">
        <Text className="medium-16" mb="1.6rem">
          {item.name}
        </Text>
        <FrakButton className="semi-16" py=".8rem" px="5.6rem">
          {CTAText || "Invest"}
        </FrakButton>
      </Center>
    </VStack>
  );
};

export default NFTItem;
