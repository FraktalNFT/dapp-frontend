import * as React from 'react';
import IPFS from 'ipfs'
import Config from './config'

// instances
let ipfs

export const IpfsContext = React.createContext()
export const useIpfsContext = () => React.useContext(IpfsContext);

export const IpfsProvider = ({children}) => {
  const [ipfsNode, setIpfsNode] = React.useState();
  const [loading, setLoading] = React.useState(false);


  React.useEffect(() => {
    async function configurePinService(ipfs){ // not supported for js-ipfs?
      await ipfs.pin.remote.sevice.add('pinata', {
        endpoint: new URL("https://api.pinata.cloud/psa"),
        key: 'b141be81ee5cc62bf368'
      })
    }

    const initIPFS = async () => {
        setLoading(true) //does not work!
        ipfs = await IPFS.create(Config.ipfs)
        // configurePinService(ipfs)
        // console.log('IPFS connected!',ipfs)
        setIpfsNode(ipfs)
        console.log('IPFS node connected')
        ipfs.libp2p.connectionManager.on('peer:connect', (peerId) => {
          console.info('peer:connect', peerId.toString())
        })
        // await ipfs.pin.remote.sevice.add('pinata', {
        //   endpoint: new URL("https://api.pinata.cloud/psa"),
        //   key: 'b141be81ee5cc62bf368'
        // })
        return ipfs;
      }
    initIPFS().then(setLoading(false))

  }, []); // eslint-disable-line react-hooks/exhaustive-deps



  return <IpfsContext.Provider value={[ipfsNode, loading]}>{children}</IpfsContext.Provider>
}
