import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { PropertyFactoryABI } from '@/lib/abis/PropertyFactory'

const PROPERTY_FACTORY_ADDRESS = process.env.NEXT_PUBLIC_PROPERTY_FACTORY_ADDRESS as `0x${string}`

export function usePropertyFactory() {
  // Read: Get all properties count
  const { data: propertiesCount } = useReadContract({
    address: PROPERTY_FACTORY_ADDRESS,
    abi: PropertyFactoryABI,
    functionName: 'getAllPropertiesCount',
  })

  // Read: Get all properties details
  const { data: propertiesDetails, refetch: refetchProperties } = useReadContract({
    address: PROPERTY_FACTORY_ADDRESS,
    abi: PropertyFactoryABI,
    functionName: 'getAllPropertiesDetails',
  })

  // Read: Get property details by address
  const getPropertyDetails = (propertyAddress: `0x${string}`) => {
    return useReadContract({
      address: PROPERTY_FACTORY_ADDRESS,
      abi: PropertyFactoryABI,
      functionName: 'getPropertyDetails',
      args: [propertyAddress],
    })
  }

  // Write: Create property
  const {
    writeContract: createProperty,
    data: createPropertyHash,
    isPending: isCreatingProperty,
    isError: isCreatePropertyError,
    error: createPropertyError,
  } = useWriteContract()

  // Wait for create property transaction
  const {
    isLoading: isWaitingForCreate,
    isSuccess: isCreateSuccess
  } = useWaitForTransactionReceipt({
    hash: createPropertyHash,
  })

  return {
    // Read
    propertiesCount,
    propertiesDetails,
    getPropertyDetails,
    refetchProperties,

    // Write
    createProperty,
    isCreatingProperty,
    isWaitingForCreate,
    isCreateSuccess,
    isCreatePropertyError,
    createPropertyError,
  }
}
