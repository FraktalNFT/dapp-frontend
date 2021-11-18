import {
  Box,
  Center,
  StackProps,
  Text,
  VStack,
  HStack,
} from "@chakra-ui/react";
import React, { forwardRef, useState, useEffect } from "react";
import { createRevenuePayment } from "../../utils/contractCalls";
import RevenuesDetail from "../revenuesDetail";
import Button from "../button";
import FrakButton2 from "../button2";
import { utils } from "ethers";
import styles from "../../pages/nft/[id]/manage.module.css";
import { useWeb3Context } from "../../contexts/Web3Context";
// if account has fraktions.. display info to list?

const RevenuesList = ({ revenuesCreated, tokenAddress }) => {
  const { account, provider } = useWeb3Context();
  const [revenueValue, setRevenueValue] = useState(0);
  const [isCreating, setIsCreating] = useState(false);
  const [valueSetter, setValueSetter] = useState(false);

  // const totalValue = (x) => utils.parseEther((x).toString());
  async function launchRevenuePayment() {
    setIsCreating(true);
    let valueIn = utils.parseEther(revenueValue.toString()); //+0.000000000001
    try {
      await createRevenuePayment(valueIn, provider, tokenAddress);
    } catch (error) {
      console.log("creating revenue failed, reason: ", error);
    }
    setIsCreating(false);
    setValueSetter(false);
    // reload page or modify the list.
  }

  return (
    <div
      style={{
        borderRadius: "4px",
        borderWidth: "1px",
        borderColor: "#E0E0E0",
        padding: "16px",
        marginTop: "40px 0px",
        width: `621.59px`,
      }}
    >
      <Box
        sx={{
          display: `flex`,
          justifyContent: `space-between`,
          alignItems: `center`,
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
          Revenues
        </div>
        {isCreating ? (
          <div style={{ margin: "16px", fontWeight: 600, fontSize: "24px" }}>
            Creating revenue payment
          </div>
        ) : (
          <div style={{ margin: "16px" }}>
            <button
              style={{
                fontSize: "16px",
                lineHeight: "19.5px",
                color: "#1750EE",
                textAlign: "right",
                fontWeight: 500,
              }}
              onClick={() => setValueSetter(!valueSetter)}
            >
              {valueSetter ? "Cancel" : "Deposit Revenue"}
            </button>
          </div>
        )}
      </Box>
      <div>
        {valueSetter && (
          <Box
            sx={{
              display: `grid`,
              gridTemplateColumns: `4fr 5fr`,
              alignItems: `start`,
            }}
          >
            <div
              style={{
                fontFamily: "Inter",
                color: "#A7A7A7",
                fontSize: "16px",
                lineHeight: "24px",
              }}
            >
              Revenues are a payment channel for Fraktion holders. Depositing
              revenue can not be undone.
            </div>
            <VStack
              style={{
                textAlign: "start",
                margin: "0 24px",
              }}
            >
              <div
                style={{
                  fontFamily: "Inter",
                  fontWeight: 600,
                  fontSize: "12px",
                  lineHeight: "14px",
                  letterSpacing: "1px",
                  color: "#A7A7A7",
                }}
              >
                DEPOSIT REVENUE IN ETH
              </div>
              <FrakButton2
                isReady={revenueValue > 0}
                onClick={launchRevenuePayment}
                setFunction={e => setRevenueValue(e)}
              >
                SEND
              </FrakButton2>
            </VStack>
          </Box>
        )}
      </div>
      <div>
        {revenuesCreated && revenuesCreated.length > 0 ? (
          <div>
            {revenuesCreated.map(x => {
              return (
                <RevenuesDetail
                  account={account}
                  revenueAddress={x.id}
                  date={x.timestamp}
                  value={x.value}
                  creator={x.creator.id}
                  buyout={x.buyout}
                  provider={provider}
                  tokenAddress={x.tokenAddress}
                />
              );
            })}
          </div>
        ) : (
          <div style={{ marginTop: "24px" }}>
            There are no revenues on this NFT.
          </div>
        )}
      </div>
    </div>
  );
};
export default RevenuesList;
