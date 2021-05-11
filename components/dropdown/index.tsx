import { Box, StackProps, Text, VStack } from "@chakra-ui/layout";
import React from "react";

const Dropdown: React.FC<
  StackProps & {
    items: string[];
    onItemClick: (item: string, index: number) => void;
  }
> = ({ items, onItemClick, ...rest }) => {
  return (
    <VStack
      rounded="2.4rem"
      border="2px solid black"
      background="white"
      minW="20rem"
      overflow="hidden"
      spacing="0"
      {...rest}
    >
      {items.map((item, index) => (
        <Box
          w="100%"
          px="3rem"
          py="1.2rem"
          onClick={onItemClick.bind(null, item, index)}
          className="semi-16"
          key={`item-${item}`}
          _hover={{ background: "black.900", color: "white.900" }}
          transition="all .3s"
          cursor="pointer"
          borderBottom={index < items.length - 1 ? "2px solid black" : null}
        >
          <Text textAlign="center">{item}</Text>
        </Box>
      ))}
    </VStack>
  );
};

export default Dropdown;
