import { formatEtherPrice } from '@/utils/format';
import { HStack, VStack } from '@chakra-ui/layout';
import {
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from '@chakra-ui/react';
import { BigNumber, utils } from 'ethers';

const ListCard = ({
  totalPrice,
  setTotalPrice,
  totalAmount,
  setTotalAmount,
  listingProcess,
  maxFraktions,
}) => {
  const wei = totalPrice > 0 && utils.parseEther(totalPrice.toString());
  const fei = totalAmount > 0 && utils.parseEther(totalAmount.toString());
  const pricePerFraktion =
    totalPrice > 0 && totalAmount > 0
      ? wei.mul(utils.parseEther('1.0')).div(fei)
      : 0;
  return (
    <HStack>
      <VStack>
        <div
          style={{
            fontWeight: 600,
            fontSize: '12px',
            lineHeight: '14px',
            letterSpacing: '1px',
            color: '#656464',
          }}
        >
          TOTAL PRICE
        </div>
        <input
          disabled={listingProcess}
          onChange={(e) => {
            setTotalPrice(e.target.value);
          }}
          type="number"
          style={{
            margin: '8px',
            border: '2px solid #E0E0E0',
            padding: '14.5px 16px',
            background: '#FFFFFF',
            borderRadius: '16px',
          }}
        ></input>
        <div
          style={{
            fontWeight: 300,
            fontSize: '12px',
            lineHeight: '14px',
            letterSpacing: '1px',
            color: '#656464',
          }}
        >
          Per Fraktion:{' '}
          {pricePerFraktion ? formatEtherPrice(pricePerFraktion) : null} ETH
        </div>
      </VStack>
      <VStack>
        <div
          style={{
            fontWeight: 600,
            fontSize: '12px',
            lineHeight: '14px',
            letterSpacing: '1px',
            color: '#656464',
          }}
        >
          TOTAL AMOUNT
        </div>
        <NumberInput
          keepWithinRange={true}
          allowMouseWheel
          max={maxFraktions}
          min={1}
          style={{
            margin: '8px',
          }}
          onChange={(num) => {
            setTotalAmount(num);
          }}
        >
          <NumberInputField
            disabled={listingProcess}
            style={{
              minWidth: '250px',
              border: '2px solid #E0E0E0',
              padding: '26.5px 16px',
              background: '#FFFFFF',
              borderRadius: '16px',
            }}
          />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
        <div
          style={{
            fontWeight: 300,
            fontSize: '12px',
            lineHeight: '14px',
            letterSpacing: '1px',
            color: '#656464',
          }}
        >
          Of {maxFraktions} Fraktions
        </div>
      </VStack>
    </HStack>
  );
};

export default ListCard;
