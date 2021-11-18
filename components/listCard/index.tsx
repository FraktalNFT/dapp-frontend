import { HStack, VStack } from "@chakra-ui/layout";


const ListCard = (({ totalPrice, setTotalPrice, setTotalAmount }) => {

  return (
    <HStack>
      <VStack>
        <div style={{
          fontWeight: 600,
          fontSize: '12px',
          lineHeight: '14px',
          letterSpacing: '1px',
          color: '#656464',
        }}>TOTAL PRICE</div>
        <input
          onChange = {(e)=>{setTotalPrice(e.target.value)}}
          style={{
            margin: '8px',
            border: '2px solid #E0E0E0',
            padding: '14.5px 16px',
            background: '#FFFFFF',
            borderRadius: '16px'
        }}></input>
        <div style={{
          fontWeight: 300,
          fontSize: '12px',
          lineHeight: '14px',
          letterSpacing: '1px',
          color: '#656464'

        }}>Per Fraktion: {totalPrice? totalPrice/10000 : null} ETH</div>
      </VStack>
      <VStack>
        <div style={{
          fontWeight: 600,
          fontSize: '12px',
          lineHeight: '14px',
          letterSpacing: '1px',
          color: '#656464',
        }}>TOTAL AMOUNT</div>
        <input
          onChange={(e)=>{setTotalAmount(e.target.value)}}
          type="number"
          style={{
            margin: '8px',
            border: '2px solid #E0E0E0',
            padding: '14.5px 16px',
            background: '#FFFFFF',
            borderRadius: '16px'
        }}></input>
        <div style={{
          fontWeight: 300,
          fontSize: '12px',
          lineHeight: '14px',
          letterSpacing: '1px',
          color: '#656464'

        }}>Of 10000 Fraktions</div>
      </VStack>
    </HStack>

  );
});

export default ListCard;
