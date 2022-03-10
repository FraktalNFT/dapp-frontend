import { VStack, HStack } from '@chakra-ui/layout';
import { Text } from '@chakra-ui/react';
import { BigNumber, utils } from 'ethers';
import React, { forwardRef, useState } from 'react';
import FrakButton2 from '../button2';
import { buyFraktions } from '../../utils/contractCalls';
import { parseUnits } from 'ethers/lib/utils';
import { connect } from 'react-redux';
import {
  addAmount,
  BUYING_FRAKTIONS,
  rejectContract,
  removeAmount,
} from '../../redux/actions/contractActions';
import { roundUp } from '../../utils/math';
import { useLoadingScreenHandler } from 'hooks/useLoadingScreen';

interface listedItemProps {
  amount: number;
  price: number;
  seller: string;
}

const FraktionsDetail = forwardRef<HTMLDivElement, listedItemProps>(
  ({
    amount,
    price,
    seller,
    tokenAddress,
    marketAddress,
    provider,
    addFraktionAmount,
    removeFraktionAmount,
    buyFraktionsRejected,
  }) => {
    const [isReady, setIsReady] = useState(false);
    const [amountToBuy, setAmountToBuy] = useState(0);
    const [buying, setBuying] = useState(false);
    const { closeLoadingModalAfterDelay } = useLoadingScreenHandler()

    const toPay = () => {
      const fei = utils.parseEther(amountToBuy.toString());
      const weiPerFrak = utils.parseUnits(price.toString(), 0);

      let toPaid = fei.mul(weiPerFrak).div(utils.parseEther('1.0'));
      toPaid = toPaid.add(utils.parseEther('0.00000000000000001'));
      return toPaid;
      // const _price = utils.parseEther(
      //   (
      //     ((BigNumber.from(amountToBuy).mul(utils.formatEther(price.toString()))).add(BigNumber.from("0.00000000000000001"))).toString()
      //   )
      // );
      // return "1";
    };

    const priceParsed = (price) => {
      return roundUp((utils.formatEther(price) * 100000) / 100000, 3);
    };

    let amountString = '';

    let feiString = '';
    amountString = utils.formatEther(parseUnits(amount.toString(), 'wei'));

    //  if(BigNumber.from(amount).lt(utils.parseEther("0.01"))){
    //   amountString = utils.formatEther(parseUnits(amount.toString(),"wei"));
    //   // amountString = "<0.01";
    //    feiString = amount.toString();
    //  }else{
    //    amountString = utils.formatEther(parseUnits(amount.toString(),"wei"));
    //  }

    async function onBuy() {
      setBuying(true);
      try {
        addFraktionAmount(amountToBuy);
        let tx = buyFraktions(
          seller,
          tokenAddress,
          utils.parseEther(amountToBuy.toString()),
          toPay(),
          provider,
          marketAddress
        );
        tx.then(() => {
          setBuying(false);
          setAmountToBuy(0);
          closeLoadingModalAfterDelay()
        }).catch((error) => {
          buyFraktionsRejected(error, onBuy);
        });
      } catch (err) {
        buyFraktionsRejected(err, onBuy);
        console.error('Error', err);
      }
    }
    function onSetAmount(d) {
      if (parseInt(d) && parseInt(d) <= amount) {
        setAmountToBuy(d);
        setIsReady(true);
      } else {
        setIsReady(false);
      }
    }
    return (
      <HStack
        style={{
          marginTop: '24px',
          justifyContent: 'space-between',
        }}
      >
        <VStack
          style={{
            textAlign: 'start',
          }}
        >
          <div
            style={{
              fontFamily: 'Inter',
              fontWeight: 600,
              fontSize: '12px',
              lineHeight: '14px',
              letterSpacing: '1px',
              color: '#A7A7A7',
              alignSelf: 'end',
            }}
          >
            AVAILABLE
          </div>
          <div
            style={{
              fontFamily: 'Inter',
              fontWeight: 600,
              fontSize: '32px',
              lineHeight: '40px',
              color: '#000000',
            }}
          >
            {/* {utils.formatEther(amount)} */}
            {amountString}
            {/* {amount.toLocaleString()} */}
          </div>

          <div
            style={{
              fontFamily: 'Inter',
              fontWeight: 'normal',
              fontSize: '12px',
              lineHeight: '14px',
              letterSpacing: '1px',
              color: '#656464',
              alignSelf: 'end',
            }}
          >
            of 10,000
          </div>
        </VStack>
        <VStack
          style={{
            textAlign: 'start',
            marginLeft: '24px',
          }}
        >
          <div
            style={{
              fontFamily: 'Inter',
              fontWeight: 600,
              fontSize: '12px',
              lineHeight: '14px',
              letterSpacing: '1px',
              color: '#A7A7A7',
              alignSelf: 'end',
            }}
          >
            PRICE
          </div>
          <HStack>
            <img
              src="/eth.png"
              alt={'ETH'}
              style={{ height: '26px', marginRight: '4px' }}
            />
            <div
              style={{
                fontFamily: 'Inter',
                fontWeight: 600,
                fontSize: '32px',
                lineHeight: '40px',
                color: '#000000',
                maxWidth: '200px',
              }}
            >
              {priceParsed(price)}
            </div>
          </HStack>
          <div
            style={{
              fontFamily: 'Inter',
              fontWeight: 'normal',
              fontSize: '12px',
              lineHeight: '14px',
              letterSpacing: '1px',
              color: '#656464',
              alignSelf: 'end',
            }}
          >
            per Fraktion
          </div>
        </VStack>
        <VStack
          style={{
            textAlign: 'end',
            marginLeft: '24px',
          }}
        >
          <div
            style={{
              fontFamily: 'Inter',
              fontWeight: 600,
              fontSize: '12px',
              lineHeight: '14px',
              letterSpacing: '1px',
              textAlign: 'end',
              color: '#A7A7A7',
            }}
          >
            BUY FRAKTIONS
          </div>
          <FrakButton2
            isReady={isReady}
            onClick={onBuy}
            setFunction={onSetAmount}
            currency={'FRAKTIONS'}
          >
            {buying ? 'BUYING' : 'BUY'}
          </FrakButton2>
          {amountToBuy > 0 ? (
            <div
              style={{
                fontFamily: 'Inter',
                fontWeight: 'normal',
                fontSize: '12px',
                lineHeight: '14px',
                letterSpacing: '1px',
                color: '#656464',
              }}
            >
              equals {amountToBuy / 100}% of ownership for{' '}
              {amountToBuy * utils.formatEther(price)} ETH
            </div>
          ) : null}
        </VStack>
      </HStack>
    );
  }
);

const mapStateToProps = (state) => {
  return {
    contractTransaction: state.loadingScreen,
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    addFraktionAmount: (amount) => {
      dispatch(addAmount(amount));
    },
    removeFraktionAmount: () => {
      dispatch(removeAmount());
    },
    buyFraktionsRejected: (obj, buttonAction = null) => {
      dispatch(rejectContract(BUYING_FRAKTIONS, obj, buttonAction));
    },
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(FraktionsDetail);
