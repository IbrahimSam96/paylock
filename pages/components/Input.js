// web 3 libraries 
import { useNetwork, useAccount, useSigner } from 'wagmi';

// helpers 
import debounce from 'lodash.debounce';
// Ui Libraries
import { NumericFormat } from 'react-number-format';

const CodeInput = ({ setCode }) => {

    const { isDisconnected } = useAccount();

    return (
        <span className={`self-center m-4 flex`}>
            <span className={`self-center font-bold text-xs text-[#20cc9e] dark:text-[#149adc]`}>Enter 4 digit Code:</span>
            <NumericFormat
                disabled={isDisconnected}
                className={`focus:outline-none font-extralight text-xs rounded ml-2 `}
                allowNegative={false}
                // value={code}
                onValueChange={
                    debounce((values) => {

                        if (values.floatValue != 0 && values.floatValue) {
                            // only if VALUE IS NOT 0 AND !undefined
                            // Sets Receiving Amount and Fee and calculates usdValue 
                            setCode(values.value)
                        }

                    }, 500)

                }
            />
        </span>
    )
}

export default CodeInput