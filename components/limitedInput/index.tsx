/**
 * React
 */
import { forwardRef, useState } from 'react';
/**
 * ChakraUI
 */
import { Button, ButtonProps } from '@chakra-ui/button';
import {
    NumberInput,
    NumberInputField,
    Text
} from '@chakra-ui/react';

const LimitedInput = forwardRef<
    HTMLButtonElement,
    ButtonProps & {
    isReady?: boolean;
    setFunction: Function;
    inputPlaceholder: string;
    currency: string;
    maxFraktions: string;
}

    >(
    ({
         isReady,
         onClick,
         setFunction,
         inputPlaceholder,
         currency,
         children,
         maxFraktions,
         ...rest
     }) => {

        const [color, setColor] = useState("#000");

        return (
            <div
                style={{
                    display: 'flex',
                    justifyContent: `space-between`,
                    alignItems: `center`,
                    border: `2px solid #405466`,
                    borderRadius: '16px',
                    maxWidth: `300px`,
                    position: `relative`,
                }}
            >
            <NumberInput
                    keepWithinRange={true}
                    allowMouseWheel
                    max={maxFraktions}
                    min={1}
                    style={{
                        color: color
                    }}
                    onChange={(num) => {
                        setFunction(num);
                        if (num > maxFraktions) {
                            setColor("red");
                        } else {
                            setColor("#000");
                        }
                    }}
                >
                    <NumberInputField
                        style={{
                            minWidth: '290px',
                            border: '2px solid #E0E0E0',
                            padding: '17px 16px',
                            background: '#FFFFFF',
                            borderRadius: '16px',
                        }}
                    />
                </NumberInput>
                <div>
                    <Text
                        style={{
                            border: `1px solid transparent`,
                            color: '#777777',
                            fontSize: '14px',
                            maxWidth: '50px',
                            padding: '4px',
                            wordWrap: 'initial',
                            position: 'relative',
                            left: "-190px",
                            boxSizing: `content-box`,
                            transform: `translateX(2px) translateY(-2px)`,
                        }}
                    >
                        {currency ? currency : null}
                    </Text>
                </div>
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
            </div>
        );
    }
);

export default LimitedInput;