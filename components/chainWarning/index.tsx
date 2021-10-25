import { utils } from 'ethers';
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
    <div style={{
      width: '100%',
      border: '1px solid #FF0000',
      justifyContent: 'center',
      display: 'flex',
      marginTop: '32px',
      padding: '16px',
      borderRadius: '4px',
    }}>
      <div style={{
        fontWeight: 500,
        fontSize: '16px',
        lineHeight: '19px',
        color: '#000000',
      }}>Wrong network</div>
      <div style={{
        cursor: 'pointer',
        color: '#656464',
        fontSize: '14px',
        lineHeight: '17px',
        margin: '0px 4px'
      }}
      onClick={()=>switchChainOnMetaMask()}
      >Click here to switch to Rinkeby</div>
    </div>
  );
};

export default ChainWarning;
