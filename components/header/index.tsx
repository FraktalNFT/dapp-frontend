import { Box, Flex, HStack, Image, Link, VStack } from "@chakra-ui/react";
import { useState } from "react";
import NextLink from "next/link";
import FrakButton from "../button";
import Modal from "../modal";
import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
  modalHeader: { fontSize: "32px", fontWeight: 600, marginTop: "8px" },
  modalButton: {
    width: "240px",
    padding: "12px 34px",
    border: "2px solid #E88A3A",
    borderRadius: "24px",
    fontSize: "16px",
    fontWeight: 600,
    cursor: "pointer",
    textAlign: "center",
  },
});

const Header = () => {
  const [walletModal, setWalletModal] = useState(false);
  const styles = useStyles();
  // TODO: Make wallet connection functional
  const walletAddress = undefined;
  // const walletAddress = "undefined";

  return (
    <Box minH="10rem" py="2.6rem" as="header" bg={"white"} id={"header"}>
      <Modal open={walletModal} onClose={() => setWalletModal(false)}>
        <VStack p="24px" w="600px" minH="248px" spacing={"24px"}>
          <div className={styles.modalHeader}>Connect Your Wallet</div>
          <div className={styles.modalButton}>Connect to MetaMask</div>
          <div
            className={styles.modalButton}
            style={{ border: "2px solid #559AF7", marginBottom: "8px" }}
          >
            Use WalletConnect
          </div>
        </VStack>
      </Modal>
      <Flex maxW="96.4rem" mx="auto" as="nav" justify="space-between">
        <HStack spacing="8">
          <NextLink href="/">
            <Link>
              <Image src="/logo.svg" alt="logo" width="75px" />
            </Link>
          </NextLink>
        </HStack>
        <Flex align="center">
          <HStack
            spacing="3.2rem"
            mr="3.2rem"
            display={{ base: "none", md: "flex" }}
          >
            <NextLink href="/mint-nft">
              <Link className="semi-16">Mint NFT</Link>
            </NextLink>
            <NextLink href="/marketplace">
              <Link className="semi-16">Marketplace</Link>
            </NextLink>
            <NextLink href="/artists">
              <Link className="semi-16">Artists</Link>
            </NextLink>
            <NextLink href="/dao">
              <Link className="semi-16">DAO</Link>
            </NextLink>
            <NextLink href="/learn-more">
              <Link className="semi-16">Learn More</Link>
            </NextLink>
          </HStack>
          {!walletAddress ? (
            <FrakButton onClick={() => setWalletModal(true)}>
              Connect Wallet
            </FrakButton>
          ) : (
            <NextLink href="/my-nfts">
              <FrakButton isOutlined>{walletAddress} | View my NFTs</FrakButton>
            </NextLink>
          )}
        </Flex>
      </Flex>
    </Box>
  );
};

export default Header;
