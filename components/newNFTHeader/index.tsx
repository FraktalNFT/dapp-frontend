
/**
 * React
 */
import { useEffect, useState } from 'react';
import {useRouter} from "next/router";
import {Box, Link, Text} from "@chakra-ui/react";
import {CREATE_NFT, IMPORT_NFTS} from "@/constants/routes";

/**
 * MyNFTWallet
 * @constructor
 */
const NewNFTHeader = () => {
    const router = useRouter();

    // Show Loading State
    useEffect(() => {

    }, []);

    return (
        <>
            <div style={{ marginBottom: '24px', display: `flex`, gap: `16px` }}>
                <Link
                    className="semi-16"
                    borderRadius="25"
                    padding="5"
                    _hover={{ bg: 'black', textColor: 'white' }}
                    onClick={() => router.push(CREATE_NFT, null, { scroll: false })}
                >
                    Mint NFT
                </Link>
                <Link
                    className="semi-16"
                    borderRadius="25"
                    padding="5"
                    sx={{
                        backgroundColor: `black`,
                        color: `white`,
                        border: `2px solid transparent`,
                    }}
                    _hover={{ color: `white` }}
                    onClick={() => router.push(IMPORT_NFTS, null, { scroll: false })}
                >
                    Import NFT
                </Link>
            </div>
        </>
    );
}

export default NewNFTHeader;