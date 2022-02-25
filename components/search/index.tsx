/**
 * React
 */
import React, { useState, useEffect } from "react";
/**
 * Chakra UI
 */
import { Box, Grid, HStack, VStack, Text, Spinner } from "@chakra-ui/react";

/**
 * Search
 */
import SelectSearch from 'react-select-search';
import {useENSAddress} from "@/components/useENSAddress";
import {getSubgraphData} from "@/utils/graphQueries";

/**
 *
 * @returns {any}
 * @constructor
 */
const Search = (props) => {

    //const [isENSAddressValid, ethAddressFromENS] = useENSAddress(inputAddress);
    const [inputAddress, setInputAddress] = useState("");

    const options = [
        {
            name: 'Fraktions',
            type: 'group',
            items: [{
                value: 'FRAKTIONS - God Mode',
                name: 'Test',
                imageURL: 'https://image.fraktal.io/?width=48&height=48&fit=cover&image=https://bafybeihv4btcn3v2jmq3yuqvrghinfkigurfnztipxqrha6jf42347ixtu.ipfs.dweb.link',
            }, {
                value: 'FRAKTIONS - God Mode God Mode',
                name: 'Picard',
                imageURL: 'https://image.fraktal.io/?width=48&height=48&fit=cover&image=https://bafybeih7cg3w7v67634ewxbh3hciytfq44drbui52auoo6qkkzworsndri.ipfs.dweb.link',
            }]
        },
        {
            name: 'Artist',
            type: 'group',
            items: [{
                value: 'Artist - soft',
                name: 'Artist 1',
                imageURL: 'https://image.fraktal.io/?width=48&height=48&fit=cover&image=https://bafybeigpgrdre5tztyrl4c2sgnd5b5yhccwvub5cdp4ep3gnqhy3rlcbbe.ipfs.dweb.link',
            },
                {
                value: 'Artist - beer',
                name: 'Artist 2',
                imageURL: 'https://image.fraktal.io/?width=48&height=48&fit=cover&image=https://bafybeigpgrdre5tztyrl4c2sgnd5b5yhccwvub5cdp4ep3gnqhy3rlcbbe.ipfs.dweb.link',
            }]
        }
    ];

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
                <img style={imgStyle} width="48" height="48" src={values.imageURL}/><span>{values.name}</span>
            </span>
        </button>);
    }

    /**
     * Handle Change
     * @param args
     */
    async function handleChange(...args)  {
        console.log(args[1])
        switch (args[1].groupName) {
            case 'Fraktions':
                const listedData = await getSubgraphData("search_items", "", {
                name: "Fraktal"
            });
                console.log(listedData)

                break;
            case 'Artist':
                break;
        }
    };

    return (
        <HStack {...props}>
            <SelectSearch
                renderOption={renderItem}
                onChange={handleChange}
                filterOptions={handleFilter}
                emptyMessage="Not found"
                options={options}
                value=""
                search
                placeholder="Search Fraktal"
            />
        </HStack>
    );
};

export default Search;