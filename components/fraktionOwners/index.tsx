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
      // const res = await getSubgraphData("fraktal_owners", id); // borken :(
      const res = {
        fraktalNfts: [
          {
            fraktions: [
              {
                amount: "5000",
                owner: {
                  address: "0x42541a2Ba03cAe418CdB70525c55a0A0a5FD254F",
                },
              },
              {
                amount: "1000",
                owner: {
                  address: "0x42541a2ba03cae418cdb70525c55a0a0a5fd254f",
                },
              },
              {
                amount: "10",
                owner: {
                  address: "0x3cd751e6b0078be393132286c442345e5dc49699",
                },
              },
            ],
          },
        ],
      };
      setInternalData(res);
    }
    if (nftObject.id) {
      console.log(nftObject.id);
      getOwners(nftObject.id);
    }
  }, [nftObject]);

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
        {internalData.fraktalNfts &&
          internalData?.fraktalNfts[0].fraktions?.map(
            (user: object, index: number) => {
              let first4 = user.owner.address.substring(0, 6); // (0x + 4 digits)
              let last4 = user.owner.address.substring(
                user.owner.address.length - 4,
                user.owner.address.length
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
                    <a href={`https://etherscan.io/address/${user.address}`}>
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
