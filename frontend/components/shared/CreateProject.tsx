'use client';
import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt} from 'wagmi';
import { PROJECT_FACTORY_CONTRACT_ADDRESS, PROJECT_FACTORY_ABI } from '@/constants';
import { Alert } from '../ui/alert';

const CreateProject = () => {

  const [projectName, setProjectName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [projectValue, setProjectValue] = useState(0);
  const { address } = useAccount();
  
  const { data: hash, error, isPending, writeContract } = useWriteContract()
  const handleCreateProject = async() => { 
      writeContract({
          address: PROJECT_FACTORY_CONTRACT_ADDRESS,
          abi: PROJECT_FACTORY_ABI,
          functionName: "createProject",
          account: address,
          args: [tokenSymbol, projectName, projectValue]
      })
  }

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash, 
    })
  

  return (
  <form onSubmit={handleCreateProject} className="space-y-4 max-w-md mx-auto p-4">
      <div>
        <label htmlFor="projectName" className="block text-sm font-medium text-gray-700">
          Project Name
        </label>
        <input
          type="text"
          id="projectName"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label htmlFor="tokenSymbol" className="block text-sm font-medium text-gray-700">
          Token Symbol
        </label>
        <input
          type="text"
          id="tokenSymbol"
          value={tokenSymbol}
          onChange={(e) => setTokenSymbol(e.target.value)}
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
        <label htmlFor="projectValue" className="block text-sm font-medium text-gray-700">
          Project Value (USD value)
        </label>
        <input
          type="number"
          id="projectValue"
          value={projectValue}
          onChange={(e) => setProjectValue(Number(e.target.value))}
          step="0.000000000000000001"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {isPending ? 'Creating...' : 'Create Project'}
      </button>
    </form>
  )
}

export default CreateProject;