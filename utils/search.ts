import {createListed, createListedAuction, createObject} from "@/utils/nftHelpers";
import {getSubgraphData} from "@/utils/graphQueries";

//TODO - REFACTOR
async function mapListed(listedItems) {
    let objects = await Promise.all(
        listedItems.map(x => {
            let res = createListed(x);
            if (typeof res !== "undefined" && x.amount > 0) {
                return res;
            }
        }).filter(notUndefined => notUndefined !== undefined)
    );
    return objects;
}

//TODO - REFACTOR
async function mapAuctions(listedItems) {
    let objects = await Promise.all(
        listedItems.map(x => {
            x.hash = x.fraktal.hash;
            let res = createListedAuction(x);
            if (typeof res !== "undefined") {
                return res;
            }
        }).filter(notUndefined => notUndefined !== undefined)
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

        }).filter(notUndefined => notUndefined !== undefined)
    );
    return objects;
}

//TODO - REFACTOR
async function mapNotForSale(listedItems) {
    let objects = await Promise.all(
        listedItems.map(x => {
            let res = createListed(x);
            if (typeof res !== "undefined" && x.amount == 0) {
                return res;
            }
        }).filter(notUndefined => notUndefined !== undefined)
    );
    return objects;
}

/**
 * Get Search Items
 * @param query
 * @param options
 */
async function getItems(query, options = []) {
    if (query.length < 2) {
        return [];
    }
    const searchData = await getSubgraphData("search_items", "", {
        name: "'" + query + "'" + ':*'
    });
    let listedObjects = [];
    let notForSale = [];
    let auctionsObjects = [];
    if (searchData?.fraktalSearch !== undefined && searchData?.fraktalSearch.length > 0) {
        listedObjects = await mapListed(searchData.fraktalSearch);
        notForSale = await mapNotForSale(searchData?.fraktalSearch);
    }
    if (searchData?.userSearch !== undefined && searchData?.userSearch.length > 0) {
        //TODO - Validate Creator ID
        const creator = query;
        listedObjects = await mapListed(searchData.userSearch[0].listedItems);
        auctionsObjects = await mapAuctions(searchData.userSearch[0].auctionItems);
        notForSale = await mapFraktion(searchData?.userSearch, creator);
    }

    if (searchData?.auctionSearch !== undefined && searchData?.auctionSearch.length > 0) {
        auctionsObjects = await mapAuctions(searchData.auctionSearch);
    }

    return {
        fixedPrice: listedObjects,
        auctions: auctionsObjects,
        notForSale: notForSale
    }
}

async function orderSearch() {

}

export {getItems, mapAuctions, mapFraktion, mapListed, mapNotForSale}