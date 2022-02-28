/**
 * React
 */
import React, { useState, useEffect } from "react";
/**
 * Chakra UI
 */
import { Box, Icon, Grid, HStack, VStack, Text, Spinner } from "@chakra-ui/react";

/**
 * Search
 */
import SelectSearch from 'react-select-search';
import {useENSAddress} from "@/components/useENSAddress";
import {getSubgraphData} from "@/utils/graphQueries";
import {createListed} from "@/utils/nftHelpers";
import {useRouter} from "next/router";

/**
 *
 * @returns {any}
 * @constructor
 */
const Search = (props) => {

    //const [isENSAddressValid, ethAddressFromENS] = useENSAddress(inputAddress);
    const [inputAddress, setInputAddress] = useState("");
    const router = useRouter();
    const options = [ ];

    const handleFilter = (items) => {
        return (searchValue) => {
            if (searchValue.length === 0) {
                return options;
            }
            const updatedItems = items.map((list) => {
                const newItems = list.items.filter((item) => {
                    return item.name.toLowerCase().includes(searchValue.toLowerCase());
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
        switch (object.groupName) {
            case 'Fraktions':
                router.push("/nft/" + object.tokenAddress + '/details', null,  {scroll: false});
                break;
            case 'Artist':
                break;
        }
    }

    async function mapListed(listedItems) {
        if (listedItems?.length >= 0) {
            let objects = await Promise.all(
                listedItems.map(x => {
                    let res = createListed(x);
                    if (typeof res !== "undefined") {
                        return res;
                    }
                })
            );
            return objects;
        }
    }

    async function getItems(query) {
        if (query.length < 2) {
            return options;
        }
        const listedData = await getSubgraphData("search_items", "", {
            name: query + ':*'
        });
        let objects = await mapListed(listedData.fraktalSearch);
        return [
            {
                name: 'Fraktions',
                type: 'group',
                items: objects
            },
            {
                name: 'Artist',
                type: 'group',
                items: []
            }
        ]
    }

    return (
        <HStack {...props}>
            <SelectSearch
                options={[]}
                renderOption={renderItem}
                onChange={handleChange}
                filterOptions={handleFilter}
                getOptions={getItems}
                value=""
                search
                placeholder="Search Fraktal"
            />
        </HStack>
    );
};

export default Search;