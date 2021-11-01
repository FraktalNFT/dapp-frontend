import { Divider } from "@chakra-ui/react";
import { VStack, HStack, Box, Stack } from "@chakra-ui/layout";
import React, { useState, useEffect } from "react";
import { utils } from "ethers";
import FrakButton from "../button";
import FrakButton2 from "../button2";
import OfferDetail from "../offerDetail";
import { rescueEth } from "../../utils/contractCalls";
import { Text } from "@chakra-ui/react";

const RescueCard = ({
  marketAddress,
  provider,
  gains,
}) => {
  const [isReady, setIsReady] = useState(false);

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
        Claim your sold Fraktions
      </div>
      <div>
        <>
          {gains > 0 ? (
            <>
              <HStack style={{justifyContent: 'space-between'}}>
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
                    Gains
                  </Text>
                  <Text
                    w="116px"
                    sx={{
                      fontFamily: `Inter`,
                      textTransform: `uppercase`,
                      lineHeight: '24px',
                      fontsize:'32px',
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
                    marginTop: '8px'
                  }}
                  _hover={{ cursor: `pointer` }}
                  onClick={()=>rescueEth(provider, marketAddress)}
                >
                  Claim
                </Box>
              </HStack>
            </>
          ) : (
            <div style={{ marginTop: "24px" }}>
              Nothing to claim yet.
            </div>
          )}
        </>
      </div>
    </div>
  );
};
export default RescueCard;
