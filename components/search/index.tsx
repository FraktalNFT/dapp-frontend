/**
 * React
 */
import React, { useState, useEffect } from "react";
/**
 * Chakra UI
 */
import {  HStack} from "@chakra-ui/react";

/**
 * Search
 */
import SelectSearch from 'react-select-search';
import {useENSAddress} from "@/components/useENSAddress";
import {getSubgraphData} from "@/utils/graphQueries";
import {createListed, createObject, createListedAuction} from "@/utils/nftHelpers";
import {useRouter} from "next/router";
import {resolveNFTRoute} from "@/constants/routes";

const SEARCH_LISTED_ITEMS = 'Fixed Price';
const SEARCH_AUCTION_ITEMS = 'Auctions';
const SEARCH_FRAKTIONS_ITEMS = 'Not for Sale';

/**
 * SEARCH Utils
 */
import {getItems} from '@/utils/search';
/**
 * Routers
 */

import {EXPLORE} from "@/constants/routes";
/**
 *
 * @returns {any}
 * @constructor
 */
const Search = (props) => {
    const {queryString} = props;
    //const [isENSAddressValid, ethAddressFromENS] = useENSAddress(inputAddress);
    const [inputAddress, setInputAddress] = useState("");
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const options = [ ];

    const handleFilter = (items) => {
        return (searchValue) => {
            if (searchValue.length === 0) {
                return options;
            }
            const updatedItems = items.map((list) => {
                const newItems = list.items.filter((item) => {
                    if (item !== undefined) {
                        return item.name;
                    }
                    /*if (list.name == SEARCH_LISTED_ITEMS) {
                        return item.name.toLowerCase().includes(searchValue.toLowerCase());
                    } else {
                        return item.name;
                    }*/
                });

                return { ...list, items: newItems };
            });
            return updatedItems;
        };
    };

    /**
     * Render Item
     * @param valueProps
     * @param values
     * @returns {any}
     */
    function renderItem(valueProps, values) {
        const imgStyle = {
            borderRadius: '10%',
            verticalAlign: 'middle',
            marginRight: 10,
            display: "inline"
        };

        return (<button  {...valueProps}  type="button" className={'select-search__option'}>
            <span>
                <img
                    style={imgStyle}
                    width="48" height="48"
                    src={'https://image.fraktal.io/?width=48&height=48&fit=cover&image=' + values.imageURL}/>
                <span>{values.name}</span>
            </span>
        </button>);
    }

    /**
     * Handle Change
     * @param args
     */
    async function handleChange(...args)  {
        if (args[1] === null) {
            return null;
        }
        const object = args[1];
        router.push(resolveNFTRoute(object.tokenAddress), null, {scroll: false});
      /*  switch (object.groupName) {
            case 'Fraktions':
                break;
            case 'Artist':

                break;
        }*/
    }

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
    /**
     * Get Items
     * @param query
     * @returns {Promise<any>}
     */
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
        return [
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
        ]
    }

    const onKeyUp = (event) => {
        if (event.keyCode == 13) {
            router.push(
                {
                    pathname: EXPLORE,
                    query: {
                        query:searchQuery
                    }
                }
            );
        }
    };

    function renderValue (valueProps, values) {
        setSearchQuery(values.search);
        return (
            <>
                <div className="select-search">
                    <div className="select-search__value">
                        <input {...valueProps} onKeyUp={onKeyUp} tabindex="0"  autoComplete="on" className="select-search__input"/>
                    </div>
                </div>
            </>
    )
    }

    const onFocus = (e) => {
    }

    return (
        <HStack {...props}>
            <SelectSearch
                printOptions="on-focus"
                onFocus={onFocus}
                renderValue={renderValue}
                debounce={100}
                options={[]}
                renderOption={renderItem}
                onChange={handleChange}
                filterOptions={handleFilter}
                getOptions={getItems}
                value={queryString}
                search
                placeholder="Search Fraktal"
            />
        </HStack>
    );
};
export default Search;