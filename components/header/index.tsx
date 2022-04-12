import { Box, Flex, HStack, Image, Link } from "@chakra-ui/react";
import NextLink from "next/link";
import FrakButton from "../button";
import { useWeb3Context } from "../../contexts/Web3Context";
import { shortenHash } from "../../utils/helpers";
import { useRouter } from "next/router";
import {ARTISTS, CREATE_NFT, EXPLORE, LANDING, IMPORT_NFTS, REWARDS, CLAIM, CLAIM_BONUS} from "@/constants/routes";

const Header = () => {
  const router = useRouter();
  const { connectWeb3, account } = useWeb3Context();

  return (
    <Box minH="10rem" py="2.6rem" as="header" bg={"white"}>
      <Flex maxW="96.4rem" mx="auto" as="nav" justify="space-between">
        <HStack spacing="8">
          <NextLink href={LANDING}>
            <Link>
              <Image src="/images/Logo.png" alt="logo" width="175px" />
            </Link>
          </NextLink>
        </HStack>
        <Flex align="center">
          <HStack
            spacing="2.0rem"
            mr="3.5rem"
            paddingTop="2"
            display={{ base: "none", md: "flex" }}
          >
          <NextLink href={EXPLORE}>
            {router.pathname === EXPLORE ? (
              <Link
                className="semi-16"
                borderRadius="25"
                padding="3"
                sx={{ backgroundColor: `black`, color: `white` }}
                _hover={{ backgroundColor: "black", textColor: "white" }}
              >
                Explore
              </Link>
            ) : (
              <Link
                className="semi-16"
                borderRadius="25"
                padding="3"
                _hover={{ backgroundColor: "black", textColor: "white" }}
              >
                Explore
              </Link>
            )}
          </NextLink>
          <NextLink href={CREATE_NFT}>
                    {router.pathname === CREATE_NFT ||
                    router.pathname === IMPORT_NFTS ? (
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
            <NextLink href={REWARDS}>
                {router.pathname === REWARDS ? (
                    <Link
                        className="semi-16"
                        borderRadius="25"
                        padding="3"
                        sx={{ backgroundColor: `black`, color: `white` }}
                        _hover={{ backgroundColor: "black", textColor: "white" }}
                    >
                        Rewards
                    </Link>
                ) : (
                    <Link
                        className="semi-16"
                        borderRadius="25"
                        padding="3"
                        _hover={{ backgroundColor: "black", textColor: "white" }}
                    >
                        Rewards
                    </Link>
                )}
          </NextLink>
        
      {/*      <Link
              href="https://docs.fraktal.io/marketplace/get-started"
              target="_blank"
              className="semi-16"
              borderRadius="25"
              padding="3"
              _hover={{ backgroundColor: "black", textColor: "white" }}
            >
              How it Works
            </Link> */}

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
                {shortenHash(account)} | View my NFTs
              </FrakButton>
            </NextLink>
          )}
        </Flex>
      </Flex>
    </Box>
  );
};

export default Header;
