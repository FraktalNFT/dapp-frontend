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
import {useRouter} from "next/router";
import {resolveAuctionNFTRoute, resolveNFTRoute} from "@/constants/routes";

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
    const {queryString, addFilter} = props;
    //const [isENSAddressValid, ethAddressFromENS] = useENSAddress(inputAddress);
    const [inputAddress, setInputAddress] = useState("");
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [displayOptions, setDisplayOptions] = useState('auto');
    const options = [ ];
    const [results, setResults] = useState([]);

    const handleFilter = (items) => {
        return (searchValue) => {
            if (searchValue.length === 0 || items === undefined) {
                return results;
            }
            const updatedItems = items.map((list) => {
                const newItems = list.items.filter((item) => {
                    if (item !== undefined) {
                        return item.name;
                    }
                });

                return { ...list, items: newItems };
            });
            setResults(updatedItems);
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
                    src={'https://image.fraktal.io/?width=48&height=48&fit=cover&image=' + encodeURIComponent(values.imageURL)}/>
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
        switch (object.groupName) {
            case SEARCH_AUCTION_ITEMS:
                router.push(resolveAuctionNFTRoute(object.seller + '-' + object.sellerNonce), null, {scroll: false});
                break;
            default:
                router.push(resolveNFTRoute(object.tokenAddress), null, {scroll: false});
                break;
        }
    }
    /**
     * Get Items
     * @param query
     * @returns {Promise<any>}
     */
    async function getSearchItems(query) {
      if (searchQuery == query) {
          return;
      }
      const results = await getItems(query, {
          limit: 20,
          offset: 0
      });
      return [
            {
                name: SEARCH_LISTED_ITEMS,
                type: 'group',
                items: results.fixedPrice !== undefined ? results.fixedPrice : []
            },
            {
                name: SEARCH_AUCTION_ITEMS,
                type: 'group',
                items: results.auctions !== undefined ? results.auctions : []
            },
            {
                name: SEARCH_FRAKTIONS_ITEMS,
                type: 'group',
                items: results.notForSale !== undefined ? results.notForSale : []
            },
        ]
    }

    const onKeyUp = (event) => {
        if (event.keyCode == 13) {
            setDisplayOptions("never");
            addFilter(searchQuery).then(() => {
            //    setDisplayOptions("auto");
            });
        }
    };

    function renderValue (valueProps, values) {
        setSearchQuery(values.search);
        return (
            <>
                <div className="select-search">
                    <div className="select-search__value">
                        <input {...valueProps} onKeyUp={onKeyUp} tabIndex="0"  autoComplete="on" className="select-search__input"/>
                    </div>
                </div>
            </>)
    }

    const onFocus = (e) => {
        setDisplayOptions("auto");
    };

    return (
        <HStack {...props}>
            <SelectSearch
                printOptions={displayOptions}
                onFocus={onFocus}
                renderValue={renderValue}
                debounce={100}
                options={[]}
                renderOption={renderItem}
                onChange={handleChange}
                filterOptions={handleFilter}
                getOptions={getSearchItems}
                value={queryString}
                search
                placeholder="Search Fraktal"
            />
        </HStack>
    );
};
export default Search;