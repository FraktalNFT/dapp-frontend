import {
  Box,
  Center,
  StackProps,
  Text,
  VStack,
  HStack,
  Stack,
} from "@chakra-ui/layout";
import React, { forwardRef, useState, useEffect } from "react";
import { createRevenuePayment } from "../../utils/contractCalls";
import RevenuesDetail from "../revenuesDetail";
import FrakButton2 from "../button2";
import { utils } from "ethers";
import { getSubgraphData } from "../../utils/graphQueries";

// if account has fraktions.. display info to list?

export default function FraktionOwners(props) {
  let internalData = props.data;
  let nftObject = props.nftObject;

  const [owners, setOwners] = useState([]);

  useEffect(() => {
    async function getOwners(id) {
      const res = await getSubgraphData("fraktal_owners", id);
      console.log(res);
    }
    getOwners(nftObject.id);
  }, []);

  if (internalData.length <= 0) {
    internalData = [
      {
        address: `0xBc4A2b0B65e39bAE9bedad1798B824EAf0A60639`,
        ownership: `2%`,
      },
      {
        address: `0xBc4A2b0B65e39bAE9bedad1798B824EAf0A60639`,
        ownership: `0.012%`,
      },
      {
        address: `0xBc4A2b0B65e39bAE9bedad1798B824EAf0A60639`,
        ownership: `0.12%`,
      },
    ];
  }
  return (
    <div
      style={{
        borderRadius: "4px",
        borderWidth: "1px",
        borderColor: "#E0E0E0",
        padding: "16px",
        marginTop: "40px 0px",
      }}
    >
      <HStack>
        <div
          style={{
            color: "#5A32F3",
            fontWeight: "bold",
            fontFamily: "Inter",
            fontSize: "24px",
            lineHeight: "29px",
          }}
        >
          Fraktion Owners
        </div>
      </HStack>
      <div>
        <Box sx={{ display: `flex`, justifyContent: `space-between` }}>
          <Text
            sx={{
              fontFamily: `Inter`,
              opacity: `0.7`,
              fontVariant: `small-caps`,
              textTransform: `lowercase`,
            }}
          >
            Address
          </Text>
          <Text
            sx={{
              fontFamily: `Inter`,
              opacity: `0.7`,
              fontVariant: `small-caps`,
              textTransform: `lowercase`,
              textAlign: `right`,
            }}
          >
            Ownership
          </Text>
        </Box>
        {internalData.map((user: object, index: number) => {
          let first4 = user.address.substring(0, 6); // (0x + 4 digits)
          let last4 = user.address.substring(
            user.address.length - 4,
            user.address.length
          );
          let shortAddress = `${first4}...${last4}`;
          return (
            <Box
              sx={{
                display: `flex`,
                alignItems: `center`,
                justifyContent: `space-between`,
                margin: `4px 0`,
              }}
            >
              <Text
                sx={{ color: `hsla(224, 86%, 51%, 1)` }}
                _hover={{ cursor: `pointer` }}
              >
                <a href={`https://etherscan.io/address/${user.address}`}>
                  {shortAddress}
                </a>
              </Text>
              <Text>{user.ownership}</Text>
            </Box>
          );
        })}
      </div>
    </div>
  );
}
