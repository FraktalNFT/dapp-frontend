import { Box, Flex, HStack, Image, Link } from "@chakra-ui/react";
import NextLink from "next/link";
import FrakButton from "../button";
import { useWeb3Context } from "../../contexts/Web3Context";
import { shortenHash } from "../../utils/helpers";
import { useRouter } from "next/router";

const Header = () => {
  const router = useRouter();
  console.log(router.pathname);
  const { connectWeb3, account } = useWeb3Context();
  return (
    <Box minH="10rem" py="2.6rem" as="header" bg={"white"}>
      <Flex maxW="96.4rem" mx="auto" as="nav" justify="space-between">
        <HStack spacing="8">
          <NextLink href="/">
            <Link>
              <Image src="/images/Logo.png" alt="logo" width="175px" />
            </Link>
          </NextLink>
        </HStack>
        <Flex align="center">
          <HStack
            spacing="2.2rem"
            mr="3.2rem"
            paddingTop="2"
            display={{ base: "none", md: "flex" }}
          >
            <NextLink href="/list-nft">
              {router.pathname === "/list-nft" ||
              router.pathname === "/import-nft" ? (
                <Link
                  className="semi-16"
                  borderRadius="25"
                  padding="3"
                  sx={{ backgroundColor: `black`, color: `white` }}
                  _hover={{ backgroundColor: "black", textColor: "white" }}
                >
                  List NFT
                </Link>
              ) : (
                <Link
                  className="semi-16"
                  borderRadius="25"
                  padding="3"
                  _hover={{ backgroundColor: "black", textColor: "white" }}
                >
                  List NFT
                </Link>
              )}
            </NextLink>
            <NextLink href="/">
              {router.pathname === "/" ? (
                <Link
                  className="semi-16"
                  borderRadius="25"
                  padding="3"
                  sx={{ backgroundColor: `black`, color: `white` }}
                  _hover={{ backgroundColor: "black", textColor: "white" }}
                >
                  Marketplace
                </Link>
              ) : (
                <Link
                  className="semi-16"
                  borderRadius="25"
                  padding="3"
                  _hover={{ backgroundColor: "black", textColor: "white" }}
                >
                  Marketplace
                </Link>
              )}
            </NextLink>
            <NextLink href="/artists">
              {router.pathname === "/artists" ? (
                <Link
                  className="semi-16"
                  borderRadius="25"
                  padding="3"
                  sx={{ backgroundColor: `black`, color: `white` }}
                  _hover={{ backgroundColor: "black", textColor: "white" }}
                >
                  Artists
                </Link>
              ) : (
                <Link
                  className="semi-16"
                  borderRadius="25"
                  padding="3"
                  _hover={{ backgroundColor: "black", textColor: "white" }}
                >
                  Artists
                </Link>
              )}
            </NextLink>

            <Link
              href="https://app.daohaus.club/dao/0xa4b1/0x751eda5aa0a1c026f51942e266ed82795428ae34/"
              target="_blank"
              className="semi-16"
              borderRadius="25"
              padding="3"
              _hover={{ backgroundColor: "black", textColor: "white" }}
            >
              DAO
            </Link>

            {/*_hover={{backgroundColor: `black`}}*/}
            <Link
              href="https://twitter.com/fraktalnft"
              target="_blank"
              rel="noreferrer noopener"
            >
              <Box
                sx={{
                  display: `grid`,
                  placeItems: `center`,
                  borderRadius: `12px`,
                }}
              >
                <Image src="/footer/twitter.svg" />
              </Box>
            </Link>
            <Link
              href="https://discord.gg/B9atrdtEEx"
              target="_blank"
              rel="noreferrer noopener"
            >
              <Box
                sx={{
                  display: `grid`,
                  placeItems: `center`,
                  borderRadius: `12px`,
                }}
              >
                <Image src="/footer/discord.svg" />
              </Box>
            </Link>
            <Link
              href="https://medium.com/@fraktal"
              target="_blank"
              rel="noreferrer noopener"
            >
              <Box
                sx={{
                  display: `grid`,
                  placeItems: `center`,
                  borderRadius: `12px`,
                }}
              >
                <Image src="/footer/medium.svg" />
              </Box>
            </Link>
          </HStack>
          {!account ? (
            <FrakButton onClick={connectWeb3}>Connect Wallet</FrakButton>
          ) : (
            <NextLink href="/my-nfts">
              <FrakButton
                borderColor="#BE6DFF"
                bgColor="white"
                textColor="#9A31FE"
                _hover={{
                  textColor: "white",
                  bgGradient:
                    "linear(to-r, #BE6DFF, #BE6DFF, #9A31FE, #9A31FE, #7213F2)",
                }}
              >
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
