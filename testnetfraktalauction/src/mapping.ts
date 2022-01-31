import { BigInt,Address  } from "@graphprotocol/graph-ts"
import { Factory } from "../generated/templates";
import {
  Contract,
  AdminWithdrawFees,
  AuctionContribute,
  AuctionItemListed,
  Bought,
  Deployed,
  FeeUpdated,
  FraktalClaimed,
  ItemListed,
  OfferMade,
  OfferVoted,
  OwnershipTransferred,
  SellerPaymentPull
} from "../generated/Contract/Contract"
import {  Auction, FactoryContract } from "../generated/schema"

export function handleAdminWithdrawFees(event: AdminWithdrawFees): void {
}

export function handleAuctionContribute(event: AuctionContribute): void {
  let participant = event.params.participant.toHexString();
  // let tokenAddress = event.params.tokenAddress;
  let seller = event.params.seller.toHexString();
  let sellerNonce = event.params.sellerNonce.toString();
  // let participantContribution = event.params.value;

  let entity = Auction.load(`${seller}-${sellerNonce}`);
  if(entity == null){
    entity = new Auction(`${seller}-${sellerNonce}`);
  }

  let _participants = entity.participants;
  if(_participants)
  _participants.push(participant);

  if(entity){
    entity.participants = _participants;
    entity.save();
  }
}

export function handleAuctionItemListed(event: AuctionItemListed): void {
  let nonceString = event.params.nonce.toString();
  let sellerString = event.params.owner.toHexString();
  let id = sellerString+'-'+nonceString;
  let entity = Auction.load(id);

  if(entity == null){
    entity = new Auction(id);
    entity.auctionReserve = BigInt.fromI32(0);
    entity.participants = [];
  }


  entity.seller = event.params.owner.toHexString();
  entity.tokenAddress = event.params.tokenAddress.toHexString();
  entity.reservePrice = event.params.reservePrice;
  entity.amountOfShare = event.params.amountOfShares;
  entity.endTime = event.params.endTime;
  entity.sellerNonce = event.params.nonce;

  entity.save();
}

export function handleBought(event: Bought): void {}

export function handleDeployed(event: Deployed): void {
  let entity = new FactoryContract("factory");
  entity.address = "0xd8646ea0064538ec100881893d98537f611c53bc";
  entity.save();
  Factory.create(Address.fromString("0xd8646ea0064538ec100881893d98537f611c53bc"));
}

export function handleFeeUpdated(event: FeeUpdated): void {}

export function handleFraktalClaimed(event: FraktalClaimed): void {}

export function handleItemListed(event: ItemListed): void {}

export function handleOfferMade(event: OfferMade): void {}

export function handleOfferVoted(event: OfferVoted): void {}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {}

export function handleSellerPaymentPull(event: SellerPaymentPull): void {}
