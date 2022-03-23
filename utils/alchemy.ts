import { createAlchemyWeb3 } from "@alch/alchemy-web3";
import {getAlchemyApi} from "@/utils/helpers";

// Using HTTPS
const web3 = createAlchemyWeb3(
    getAlchemyApi(parseInt(process.env.NEXT_PUBLIC_NETWORK_CHAIN_ID)) + process.env.NEXT_PUBLIC_ALCHEMY_API_KEY,
);

export async function getNftMetadata(contractAddress, tokenId = "1") {
    const response = await web3.alchemy.getNftMetadata({
        contractAddress: contractAddress,
        tokenId: tokenId
    })

    return response;
}
