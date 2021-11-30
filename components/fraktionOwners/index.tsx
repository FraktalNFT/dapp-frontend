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
  const [internalData, setInternalData] = useState({});
  let nftObject = props.nftObject;

  // const [owners, setOwners] = useState([]);

  useEffect(() => {
    async function getOwners(id) {
      let filteredData = props.data.filter(x=>{return x.owner && x.owner.id && x.amount > 0})
      // console.log('filtered Data ', filteredData);
      setInternalData(filteredData);
    }
    if (nftObject.id) {
      // console.log('nftObject.id in fraktionsOwners',nftObject.id);
      getOwners(nftObject.id);
    }
  }, [nftObject, props]);

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
          {internalData && internalData.length && internalData.map(
              (user: object, index: number) => {
                let first4 = user.owner.id.substring(0, 6); // (0x + 4 digits)
                let last4 = user.owner.id.substring(
                  user.owner.id.length - 4,
                  user.owner.id.length
                );
                let shortAddress = `${first4}...${last4}`;
                let percentOwned = (parseInt(user.amount) / 10000) * 100;
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
                      <a href={`https://etherscan.io/address/${user.owner.id}`}>
                        {shortAddress}
                      </a>
                    </Text>
                    <Text>{percentOwned}%</Text>
                  </Box>
                );
              }
            )}

      </div>
    </div>
  );
}
