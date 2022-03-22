/**
 * React
 */
import { forwardRef, useState } from 'react';
/**
 * ChakraUI
 */
import {
    NumberInput,
    NumberInputField,
    Text
} from '@chakra-ui/react';
import { ButtonProps } from '@chakra-ui/button';
/**
 * Components
 */
import FraktalButton from "@/components/fraktalButton";

/**
 * LimitedInput Component
 */
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
                        (parseInt(num) > parseInt(maxFraktions)) ? setColor("red") : setColor("#000");
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
                <FraktalButton
                    isReady={isReady}
                    onClick={onClick}
                    {...rest}
                >
                    {children}
                </FraktalButton>
            </div>
        );
    }
);

export default LimitedInput;
