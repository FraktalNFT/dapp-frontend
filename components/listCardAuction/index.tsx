import { HStack, VStack } from "@chakra-ui/layout";
import {
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
} from '@chakra-ui/react'

const ListCardAuction = (({ totalPrice, setTotalPrice, setTotalAmount, listingProcess, maxFraktions }) => {
  return (
    <HStack>
      <VStack>
        <div style={{
          fontWeight: 600,
          fontSize: '12px',
          lineHeight: '14px',
          letterSpacing: '1px',
          color: '#656464',
        }}>RESERVE PRICE</div>
        <input
          disabled={listingProcess}
          onChange = {(e)=>{setTotalPrice(e.target.value)}}
          type="number"
          style={{
            margin: '8px',
            border: '2px solid #E0E0E0',
            padding: '14.5px 16px',
            background: '#FFFFFF',
            borderRadius: '16px',
        }}></input>
        <div style={{
          fontWeight: 300,
          fontSize: '12px',
          lineHeight: '14px',
          letterSpacing: '1px',
          color: '#656464'

        }}>Per Fraktion: {totalPrice? totalPrice/maxFraktions : null} ETH</div>
      </VStack>
      <VStack>
        <div style={{
          fontWeight: 600,
          fontSize: '12px',
          lineHeight: '14px',
          letterSpacing: '1px',
          color: '#656464',
        }}>TOTAL AMOUNT</div>
        <NumberInput keepWithinRange={true} allowMouseWheel max={maxFraktions} min={1}
                       style={{
                           margin: '8px',
                       }}>
              <NumberInputField
                  disabled={listingProcess}
                  onChange={(e) => {
                      setTotalAmount(e.target.value)
                  }}
                  style={{
                      minWidth: '250px',
                      border: '2px solid #E0E0E0',
                      padding: '26.5px 16px',
                      background: '#FFFFFF',
                      borderRadius: '16px'
                  }}/>
              <NumberInputStepper>
                  <NumberIncrementStepper/>
                  <NumberDecrementStepper/>
              </NumberInputStepper>
        </NumberInput>
        <div style={{
          fontWeight: 300,
          fontSize: '12px',
          lineHeight: '14px',
          letterSpacing: '1px',
          color: '#656464'

        }}>Of {maxFraktions} Fraktions</div>
      </VStack>
    </HStack>

  );
});

export default ListCardAuction;
