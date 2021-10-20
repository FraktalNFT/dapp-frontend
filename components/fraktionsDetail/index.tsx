import { VStack, HStack } from "@chakra-ui/layout";
import { utils } from "ethers";
import React, { forwardRef, useState } from "react";
import FrakButton2 from "../button2";
import { buyFraktions } from '../../utils/contractCalls';
interface listedItemProps {
  amount: Number;
  price: Number;
  seller: String;
}

const FraktionsDetail = forwardRef<HTMLDivElement, listedItemProps>(
  ({ amount, price, seller, tokenAddress, marketAddress, provider }) => {
    const [ isReady, setIsReady ] = useState(false);
    const [ amountToBuy, setAmountToBuy] = useState(0);
    const [buying, setBuying] = useState(false);

    const toPay = () => utils.parseEther(((amountToBuy * price)+0.00000000000000001).toString());
    const priceParsed = (price) => {return Math.round(utils.formatEther(price)*100000)/100000};

    async function onBuy(){
      setBuying(true)
      try {
        let tx = buyFraktions(
          seller,
          tokenAddress,
          amountToBuy,
          toPay(),
          provider,
          marketAddress);
        tx.then(()=>{
          setBuying(false)
          setAmountToBuy(0)
        });
        }catch(err){
          console.log('Error',err);
        }
    }
    function onSetAmount(d){
      if(parseInt(d) && parseInt(d) <= amount){
        setAmountToBuy(d);
        setIsReady(true);
      } else {
        setIsReady(false);
      }
    }
    return (
      <HStack style={{marginTop:'24px'}}>
        <VStack style={{
          textAlign:'start'
        }}>
          <div style={{
            fontFamily:'Inter',
            fontWeight:600,
            fontSize:'12px',
            lineHeight:'14px',
            letterSpacing:'1px',
            color:'#A7A7A7'
          }}>
            AVAILABLE
          </div>
          <div style={{
            fontFamily:'Inter',
            fontWeight:600,
            fontSize:'32px',
            lineHeight:'40px',
            color:'#000000'
          }}>
            {amount.toLocaleString()}
          </div>
          <div style={{
            fontFamily:'Inter',
            fontWeight:'normal',
            fontSize:'12px',
            lineHeight:'14px',
            letterSpacing:'1px',
            color:'#656464'
          }}>
            of 10,000
          </div>
        </VStack>
        <VStack style={{
          textAlign:'start',
          marginLeft:'24px'
        }}>
          <div style={{
            fontFamily:'Inter',
            fontWeight:600,
            fontSize:'12px',
            lineHeight:'14px',
            letterSpacing:'1px',
            color:'#A7A7A7'
          }}>
            PRICE
          </div>
          <HStack>
            <img src={"/eth.png"} alt={'ETH'} style={{height:'26px', marginRight:'4px'}}/>
            <div style={{
              fontFamily:'Inter',
              fontWeight:600,
              fontSize:'32px',
              lineHeight:'40px',
              color:'#000000'
            }}>
                {priceParsed(price)}
            </div>
          </HStack>
          <div style={{
            fontFamily:'Inter',
            fontWeight:'normal',
            fontSize:'12px',
            lineHeight:'14px',
            letterSpacing:'1px',
            color:'#656464'
          }}>
            per Fraktion
          </div>
        </VStack>
        <VStack style={{
          textAlign:'start',
          marginLeft:'24px'
        }}>
          <div style={{
            fontFamily:'Inter',
            fontWeight:600,
            fontSize:'12px',
            lineHeight:'14px',
            letterSpacing:'1px',
            color:'#A7A7A7'
          }}>
            BUY FRAKTIONS
          </div>
          <FrakButton2
            isReady={isReady}
            onClick={onBuy}
            onSet={onSetAmount}
          >
            {buying ? "BUYING" : "BUY"}
          </FrakButton2>
          {amountToBuy > 0 ?
            <div style={{
              fontFamily:'Inter',
              fontWeight:'normal',
              fontSize:'12px',
              lineHeight:'14px',
              letterSpacing:'1px',
              color:'#656464'
            }}>
                equals {amountToBuy/100}% of ownership
            </div>
          :
          null}
        </VStack>
      </HStack>
    );
  }
);

export default FraktionsDetail;
