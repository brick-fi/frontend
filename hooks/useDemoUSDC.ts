import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'

export function useDemoUSDC() {
  // Write: Approve
  const {
    writeContract: approve,
    data: approveHash,
    isPending,
    isError: isApproveError,
    error: approveError,
  } = useWriteContract()

  // Wait for approve transaction
  const {
    isLoading: isWaitingForApprove,
    isSuccess: isApproveSuccess
  } = useWaitForTransactionReceipt({
    hash: approveHash,
  })

  return {
    approve,
    isPending,
    isWaitingForApprove,
    isApproveSuccess,
    isApproveError,
    approveError,
  }
}
