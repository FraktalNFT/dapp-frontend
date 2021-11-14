import { utils } from 'ethers';
import { Flex } from '@chakra-ui/layout';
const ChainWarning: React.FC = () => {

  const switchChainOnMetaMask = async (): Promise<boolean> => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [
          {
            chainId: utils.hexValue(4),
          },
        ],
      });
      return true;
    } catch (switchError) {
      if (switchError.code === 4902) {
        console.log('error 4902')
      } else {
        console.error('Unable to switch to chain on metamask', switchError);
      }
    }
    return false;
  };


  return (
    <Flex w="96.4rem" alignSelf="center">
      <div style={{
        width: '100%',
        backgroundColor: '#E80E5D',
        justifyContent: 'center',
        display: 'flex',
        marginTop: '32px',
        padding: '16px',
        cursor: 'pointer',
        borderRadius: '4px',
      }}
        onClick={()=>switchChainOnMetaMask()}>
        <div style={{
          fontWeight: 500,
          fontSize: '16px',
          lineHeight: '19px',
          color: '#FFFFFF',
        }}>
          Wrong network!
        </div>
        <div style={{
          color: '#FFFFFF',
          fontSize: '14px',
          lineHeight: '17px',
          margin: '0px 4px'
        }}>
          Click here to switch to Rinkeby.
        </div>
      </div>
    </Flex>
  );
};

export default ChainWarning;
