import { VStack, HStack, Box } from "@chakra-ui/layout";
import React, { useState } from "react";
import { rescueEth } from "../../utils/contractCalls";
import { Text } from "@chakra-ui/react";
import toast from 'react-hot-toast';

const RescueCard = ({ marketAddress, provider, gains }) => {
  // const [isReady, setIsReady] = useState(false);

  async function handleEthRescue() {
    toast('Claiming ETH...');
    const response = await rescueEth(provider, marketAddress)
    if (!response?.error) {
      toast.success("ETH Claimed.");
    }
    if (response?.error) {
      toast.error("Transaction failed.");
    }
  }

  return (
    <div
      style={{
        borderRadius: "4px",
        borderWidth: "1px",
        borderColor: "#E0E0E0",
        padding: "16px",
        margin: "40px 0px",
      }}
    >
      <div
        style={{
          color: "#5A32F3",
          fontWeight: "bold",
          fontFamily: "Inter",
          fontSize: "24px",
          lineHeight: "29px",
        }}
      >
        Marketplace Profits
      </div>
      <div>
        <>
          {gains > 0 && (
            <>
              <HStack style={{ justifyContent: "space-between" }}>
                <VStack>
                  <Text
                    w="116px"
                    sx={{
                      fontFamily: `Inter`,
                      opacity: `0.7`,
                      fontVariant: `small-caps`,
                      textTransform: `lowercase`,
                      minWidth: `116px`,
                    }}
                  >
                    
                  </Text>
                  <Text
                    w="116px"
                    sx={{
                      fontFamily: `Inter`,
                      textTransform: `uppercase`,
                      lineHeight: "24px",
                      fontsize: "32px",
                    }}
                  >
                    {gains} ETH
                  </Text>
                </VStack>
                <Box
                  sx={{
                    borderColor: "#00C4B8",
                    fontSize: `20px`,
                    display: `inline-block`,
                    boxSizing: `border-box`,
                    backgroundColor: `hsla(168, 100%, 38%, 1)`,
                    padding: `4px 16px`,
                    color: `white`,
                    fontWeight: `800`,
                    fontFamily: `Inter`,
                    borderRadius: `24px`,
                    marginTop: "8px",
                  }}
                  _hover={{ cursor: `pointer` }}
                  onClick={async () => await handleEthRescue()}
                >
                  Claim
                </Box>
              </HStack>
            </>
          )}
          {(gains == 0 || gains == null) && (
              <div style={{ marginTop: "24px", textAlign: `center` }}>
                Nothing to claim yet.
              </div>
            )}
        </>
      </div>
    </div>
  );
};
export default RescueCard;
