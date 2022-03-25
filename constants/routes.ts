export const ARTISTS = '/artists';
export const CREATE_NFT = '/list-nft';
export const EXPLORE = '/explore';
//export const IMPORT_NFT = '/import-nft';
export const IMPORT_NFTS = '/import-nft';
export const LANDING = '/';
export const MINT_NFT = '/mint-nft';
export const MY_NFTS = '/my-nfts';
export const REWARDS = '/rewards';
export const NOT_FOUND = '/404';

export const resolveNFTRoute = (nftAddress: string) =>
  `/nft/${nftAddress}/details`;

export const resolveAuctionNFTRoute = (nftAddress: string) =>
  `/nft/${nftAddress}/auction`;
