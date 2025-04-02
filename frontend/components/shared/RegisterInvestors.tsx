'use client';
import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt} from 'wagmi';
import { PROJECT_CONTRACT_ABI } from '@/constants';
import { Alert } from '../ui/alert';

const RegisterInvestors = ({projectAddress}: {projectAddress: `0x${string}` | undefined}) => {

  const [investorAddress, setInvestorAddress] = useState('');
  const { address } = useAccount();
  
  const { data: hash, error, isPending, writeContract } = useWriteContract()
  const handleRegisterInvestor = async() => { 
      writeContract({
          address: projectAddress as `0x${string}`,
          abi: PROJECT_CONTRACT_ABI,
          functionName: "registerInvestor",
          account: address,
          args: [investorAddress as `0x${string}`]
      })
  }

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash, 
    })
  
  return (
  <form onSubmit={handleRegisterInvestor} className="space-y-4 max-w-md mx-auto p-4">
      <div>
        <label htmlFor="investorAddress" className="block text-sm font-medium text-gray-700">
          Investor Address
        </label>
        <input
          type="text"
          id="investorAddress"
          value={investorAddress}
          onChange={(e) => setInvestorAddress(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <div>
      <div className="flex w-full">
            {hash && (
                                <Alert className="mb-2 bg-blue-50 text-blue-700 border-blue-200">
                                    <p className="font-medium">Transaction Hash:</p>
                                    <p className="text-sm break-all">{hash}</p>
                                </Alert>
                            )}
                            {isConfirming && (
                                <Alert className="mb-2 bg-yellow-50 text-yellow-700 border-yellow-200">
                                    <p className="font-medium flex items-center">
                                        <span className="mr-2 animate-spin">⟳</span>
                                        Waiting for confirmation...
                                    </p>
                                </Alert>
                            )}
                            {isConfirmed && (
                                <Alert className="mb-2 bg-green-50 text-green-700 border-green-200">
                                    <p className="font-medium flex items-center">
                                        <span className="mr-2">✓</span>
                                        Transaction confirmed.
                                    </p>
                                </Alert>
                            )}
                            {error && (
                                <Alert className="mb-2 bg-red-50 text-red-700 border-red-200">
                                    <p className="font-medium">Error:</p>
                                    <p className="text-sm">{error.message}</p>
                                </Alert>
                            )}

        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {isPending ? 'Registering...' : 'Register Investor'}
      </button>
    </form>
  )
}

export default RegisterInvestors;