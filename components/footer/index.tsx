import { Image } from "@chakra-ui/image";
import { Center, HStack, Text, Link, VStack } from "@chakra-ui/layout";

const Footer: React.FC = () => {
  return (
    <VStack justifyContent="space-between" w="96.4rem" mx="auto" py="2.6rem">
      <HStack spacing="3.4rem">
      <Link
        href="https://www.instagram.com/fraktal.io/"
        target="_blank"
        rel="noreferrer noopener"
      >
        <Image src="/footer/icons8-instagram.svg"/>
      </Link>
        <Link
          href="https://twitter.com/fraktalnft"
          target="_blank"
          rel="noreferrer noopener"
        >
          <Image src="/footer/icons8-twitter.svg"/>
        </Link>
        <Link
          href="https://blog.fraktal.io/"
          target="_blank"
          rel="noreferrer noopener"
        >
          <Image src="/footer/icons8-medium.svg"/>
        </Link>
        <Link
          href="https://discord.gg/B9atrdtEEx"
          target="_blank"
          rel="noreferrer noopener"
        >
          <Image src="/footer/icons8-discord.svg"/>
        </Link>


      </HStack>
      <Text className="regular-16">
        Made in increments by <a href="https://app.daohaus.club/dao/0xa4b1/0x751eda5aa0a1c026f51942e266ed82795428ae34/" target="_blank"> Fraktal DAO </a>
      </Text>
    </VStack>
  );
};

export default Footer;
