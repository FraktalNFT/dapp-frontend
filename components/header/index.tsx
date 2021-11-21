import { Box, Flex, HStack, Image, Link } from "@chakra-ui/react";
import NextLink from "next/link";
import FrakButton from "../button";
import { useWeb3Context } from "../../contexts/Web3Context";
import { shortenHash } from "../../utils/helpers";

const Header = () => {
  const { connectWeb3, account } = useWeb3Context();
  return (
    <Box minH='10rem' py='2.6rem' as='header' bg={"white"}>
      <Flex maxW='96.4rem' mx='auto' as='nav' justify='space-between'>
        <HStack spacing='8'>
          <NextLink href='/'>
            <Link>
              <Image src='/logo-wide.svg' alt='logo' width='175px' />
            </Link>
          </NextLink>
        </HStack>
        <Flex align='center'>
          <HStack
            spacing='2.2rem'
            mr='3.2rem'
            paddingTop='2'
            display={{ base: "none", md: "flex" }}
          >
            <NextLink href='/list-nft' >
              <Link className='semi-16' borderRadius='25' padding='3' _hover={{bg: "black", textColor: "white"}}>List NFT</Link>
            </NextLink>
            <NextLink href='/'>
              <Link className='semi-16' borderRadius='25' padding='3' _hover={{bg: "black", textColor: "white"}}>Marketplace</Link>
            </NextLink>
            <NextLink href='/artists'>
              <Link className='semi-16' borderRadius='25' padding='3' _hover={{bg: "black", textColor: "white"}}>Artists</Link>
            </NextLink>
            <a href='https://app.daohaus.club/dao/0x4/0x721c1016044a7bd95332601bcbcf889f958be5b2' target='_blank' rel='noopener noreferrer'>
              <Link className='semi-16' borderRadius='25' padding='3' _hover={{bg: "black", textColor: "white"}}>DAO</Link>
            </a>
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
          {!account ? (
            <FrakButton onClick={connectWeb3}>Connect Wallet</FrakButton>
          ) : (
            <NextLink href='/my-nfts'>
              <FrakButton borderColor="#BE6DFF" bgColor="white" textColor="#9A31FE" _hover={{textColor: "white", bgGradient: "linear(to-r, #BE6DFF, #BE6DFF, #9A31FE, #9A31FE, #7213F2)"}}>
                {shortenHash(account)}
              </FrakButton>
            </NextLink>
          )}
        </Flex>
      </Flex>
    </Box>
  );
};

export default Header;
