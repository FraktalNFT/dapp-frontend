import React, { useContext, useState } from 'react';

const NFTIsMintingContext = React.createContext(null);

export const MintingFC = ({children}) => {
    const [isMinting, setIsMinting] = useState(false);
    function toggleMinting() {
        setIsMinting(!isMinting);
    }

    return (
        <NFTIsMintingContext.Provider
            value={{isMinting, setIsMinting}}
        >
            {children}
        </NFTIsMintingContext.Provider>
        )
}

export const useMintingContext = () => {
    const {
        isMinting,
        setIsMinting
    } = useContext(NFTIsMintingContext)
    
    return {
        isMinting,
        setIsMinting
    }
}

export { NFTIsMintingContext };