import { useEffect, useState } from 'react'
import { queryENSForETHAddress } from 'utils/stores/ensStore'

/**
 * @param inputAddress is whatever user types. Could be ETH address or ENS address
 */
export function useENSAddress(inputAddress: string) {
  const [ethAddress, setETHAddress] = useState('0')
  const [isLoading, setIsLoading] = useState(true)

  useEffect((): any => {
    async function run() {
      try {
        setETHAddress(await queryENSForETHAddress(inputAddress))
      } catch (e) {
        setETHAddress('0')
      }
    }

    setIsLoading(true)
    run()

    setIsLoading(false)
  }, [inputAddress])

  // First return value says if is valid ENS address or not
  return [parseInt(ethAddress, 16) !== 0, ethAddress, isLoading]
}
