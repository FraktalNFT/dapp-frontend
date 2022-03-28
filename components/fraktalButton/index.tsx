/**
 * React
 */
import { forwardRef, useState } from 'react';
/**
 * ChakraUI
 */
import { Button, ButtonProps } from '@chakra-ui/button';

const FraktalButton = forwardRef<
    HTMLButtonElement,
    ButtonProps & {
    isReady?: boolean;
}
    >(
    ({
         isReady, onClick, children, ...rest
     }) => {

        return (
            <>
                <Button
                    disabled={!isReady}
                    background={isReady ? '#405466' : '#A7A7A7'}
                    color={'white.900'}
                    onClick={onClick}
                    sx={{
                        borderRadius: `0px 16px 16px 0px`,
                        borderTop: `2px solid #405466`,
                        borderRight: `2px solid #405466`,
                        borderBottom: `2px solid #405466`,
                        fontSize: '1.8rem',
                        height: `38px`,
                        width: `100px`,
                        transform: `translateX(2px) translateY(-2px)`,
                        boxSizing: `content-box`,
                        position: `absolute`,
                        right: `0`,
                        top: `0`,
                        padding: `0`,
                    }}
                    _hover={{ background: 'black.900', color: 'white.900' }}
                    _active={{ background: 'black.900', color: 'white.900' }}
                    _disabled={{
                        background: '#A7A7A7 !important',
                    }}
                    {...rest}
                >
                    {children}
                </Button>
            </>
        );
    }
);

export default FraktalButton;
