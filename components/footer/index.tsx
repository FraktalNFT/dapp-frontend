import { Image } from "@chakra-ui/image";
import { Center, HStack, Text, Link, VStack } from "@chakra-ui/layout";

const Footer: React.FC = () => {
  return (
    <VStack justifyContent="space-between" w="96.4rem" mx="auto" py="2.6rem">
      <HStack spacing="3.4rem">
        <Link
          href="https://twitter.com/fraktalnft"
          target="_blank"
          rel="noreferrer noopener"
        >
          <Image src="/footer/twitter.svg"/>
        </Link>
        <Link
          href="https://discord.gg/jF7PGKha"
          target="_blank"
          rel="noreferrer noopener"
        >
          <Image src="/footer/discord.svg"/>
        </Link>
        <Link
          href="https://medium.com/@fraktal"
          target="_blank"
          rel="noreferrer noopener"
        >
          <Image src="/footer/medium.svg"/>
        </Link>
      </HStack>
      <Text className="regular-16">
        Made in increments by Fraktal.
      </Text>
    </VStack>
  );
};

export default Footer;
