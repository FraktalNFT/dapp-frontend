import {createListed, createListedAuction, createObject} from "@/utils/nftHelpers";
import {getSubgraphData} from "@/utils/graphQueries";

const SEARCH_LISTED_ITEMS = 'Fixed Price';
const SEARCH_AUCTION_ITEMS = 'Auctions';
const SEARCH_FRAKTIONS_ITEMS = 'Not for Sale';

//TODO - REFACTOR
async function mapListed(listedItems) {
    let objects = await Promise.all(
        listedItems.map(x => {
            let res = createListed(x);
            if (typeof res !== "undefined" && x.amount > 0) {
                return res;
            }
        })
    );
    return objects;
}

//TODO - REFACTOR
async function mapAuction(listedItems) {
    let objects = await Promise.all(
        listedItems.map(x => {
            x.hash = x.fraktal.hash;
            let res = createListedAuction(x);
            if (typeof res !== "undefined") {
                return res;
            }
        })
    );
    return objects;
}


//TODO - REFACTOR
async function mapFraktion(userSearch, creator) {
    let objects = await Promise.all(
        userSearch[0].fraktions.map(fraktion => {
            if (fraktion.nft.creator.id.toLowerCase() !== creator.toLowerCase()) {
                let res = createObject(fraktion);
                if (typeof res !== "undefined") {
                    return res;
                }
            }

        })
    );
    return objects;
}

async function mapNotForSale(listedItems) {
    let objects = await Promise.all(
        listedItems.map(x => {
            let res = createListed(x);
            if (typeof res !== "undefined" && x.amount == 0) {
                return res;
            }
        })
    );
    return objects;
}

async function getItems(query) {
    if (query.length < 2) {
        return options;
    }
    const searchData = await getSubgraphData("search_items", "", {
        name: "'" +query+ "'" + ':*'
    });
    let listedObjects;
    let notForSale = [];
    let auctionsObjects;
    if (searchData?.fraktalSearch !== undefined && searchData?.fraktalSearch.length > 0) {
        listedObjects = await mapListed(searchData.fraktalSearch);
        console.log(listedObjects)
        notForSale = await mapNotForSale(searchData?.fraktalSearch);
    }
    if (searchData?.userSearch !== undefined && searchData?.userSearch.length > 0) {
        //TODO - Validate Creator ID
        const creator = query;
        listedObjects = await mapListed(searchData.userSearch[0].listedItems);
        auctionsObjects = await mapAuction(searchData.userSearch[0].auctionItems);
        notForSale = await mapFraktion(searchData?.userSearch, creator);
    }

    if (searchData?.auctionSearch !== undefined && searchData?.auctionSearch.length > 0) {
        auctionsObjects = await mapAuction(searchData.auctionSearch);
    }

    return {
        fixedPrice: listedObjects,
        auctions: auctionsObjects,
        notForSale: notForSale
    }

    /*return [
        {
            name: SEARCH_LISTED_ITEMS,
            type: 'group',
            items: listedObjects !== undefined ? listedObjects : []
        },
        {
            name: SEARCH_AUCTION_ITEMS,
            type: 'group',
            items: auctionsObjects !== undefined ? auctionsObjects : []
        },
        {
            name: SEARCH_FRAKTIONS_ITEMS,
            type: 'group',
            items: notForSale !== undefined ? notForSale : []
        },
    ]*/
}

export {getItems}