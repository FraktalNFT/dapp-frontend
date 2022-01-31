import {Minted} from '../../generated/templates/Factory/Factory'
import {FraktalNFT} from '../../generated/schema'

export function handleMinted(event: Minted): void{

    let nft = FraktalNFT.load(event.params.tokenAddress.toHexString());
    if(nft==null){
        nft = new FraktalNFT(event.params.tokenAddress.toHexString());
    }
    nft.hash = event.params.urlIpfs;
    nft.save();

}