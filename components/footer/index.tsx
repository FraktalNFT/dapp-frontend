import { Image } from "@chakra-ui/image";
import { Center, HStack, Text, Link } from "@chakra-ui/layout";

const Footer: React.FC = () => {
  return (
    <Center justifyContent="space-between" w="96.4rem" mx="auto" py="3.6rem">
      <HStack spacing="2.4rem">
        <Link
          href="https://telegram.com"
          target="_blank"
          rel="noreferrer noopener"
        >
          <Image src="/footer/icon-telegram.svg" />
        </Link>
        <Link
          href="https://reddit.com"
          target="_blank"
          rel="noreferrer noopener"
        >
          <Image src="/footer/icon-reddit.svg" />
        </Link>
        <Link
          href="https://medium.com"
          target="_blank"
          rel="noreferrer noopener"
        >
          <Image src="/footer/icon-medium.svg" />
        </Link>
        <Link
          href="https://twitter.com"
          target="_blank"
          rel="noreferrer noopener"
        >
          <Image src="/footer/icon-twitter.svg" />
        </Link>
        <Link
          href="https://facebook.com"
          target="_blank"
          rel="noreferrer noopener"
        >
          <Image src="/footer/icon-facebook.svg" />
        </Link>
      </HStack>
      <Text className="regular-16">
        Copyright © Fraktal 2021. All Rights Reserved.
      </Text>
    </Center>
  );
};

export default Footer;
