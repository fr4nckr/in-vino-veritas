'use client';
import { PROJECT_CONTRACT_ABI, USDC_ADDRESS } from '@/constants';
import { useEffect, useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Alert } from '../ui/alert';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { parseUnits } from 'viem/utils';
import { erc20Abi } from 'viem';

const ApproveAndBuy = ({ projectAddress, refetchIvvBalance, refetchProjectIvvBalance }: {projectAddress: string, refetchIvvBalance: () => void, refetchProjectIvvBalance: () => void }) => {
  const { address } = useAccount();
  const [buyAmount, setBuyAmount] = useState<string>("0");
  
  const { writeContract: writeUSDC, data: approveHash, error: approveError, isPending: isApprovePending } = useWriteContract();
  const { isLoading: isApproveConfirming, isSuccess: isApproveConfirmed } = useWaitForTransactionReceipt({
    hash: approveHash,
  });
  
  const { writeContract: writeProject, data: buyHash, error: buyError, isPending: isBuyPending } = useWriteContract();
  const { isLoading: isBuyConfirming, isSuccess: isBuyConfirmed } = useWaitForTransactionReceipt({
    hash: buyHash,
  });

  const handleApproveAndBuyTokens = async () => {
    // First approve USDC
    writeUSDC({
      address: USDC_ADDRESS,
      abi: erc20Abi,
      functionName: 'approve',
      args: [projectAddress as `0x${string}`, parseUnits(buyAmount, 6)],
      account: address
    });
    
    };
  
  // Buy tokens after approval is confirmed
  useEffect(() => {
    if (isApproveConfirmed && address) {
      writeProject({
        address: projectAddress as `0x${string}`,
        abi: PROJECT_CONTRACT_ABI,
        functionName: 'buyLandPiece',
        args: [parseUnits(buyAmount, 6)],
        account: address
      });
    }
  }, [isApproveConfirmed, address, projectAddress, writeProject]);


  useEffect(() => {
    if(isBuyConfirmed) {
      refetchIvvBalance();
      refetchProjectIvvBalance();
    }
  }, [isBuyConfirmed, refetchIvvBalance, refetchProjectIvvBalance]);

  return (
    <div className="bg-gray-50 overflow-hidden">
      {/* Transaction Status Alerts */}
      <div className="p-4">
        {approveHash && (
          <Alert className="mb-2 bg-blue-50 text-blue-700">
            <p className="font-medium">Approval Transaction Hash:</p>
            <p className="text-sm break-all">{approveHash}</p>
          </Alert>
        )}
        {isApproveConfirming && (
          <Alert className="mb-2 bg-yellow-50 text-yellow-700">
            <p className="font-medium flex items-center">
              <span className="mr-2 animate-spin">⟳</span>
              En attente de confirmation de l&lsquo;approbation...
            </p>
          </Alert>
        )}
        {isApproveConfirmed && (
          <Alert className="mb-2 bg-green-50 text-green-700">
            <p className="font-medium flex items-center">
              <span className="mr-2">✓</span>
              Approbation confirmée
            </p>
          </Alert>
        )}
        {approveError && (
          <Alert className="mb-2 bg-red-50 text-red-700">
            <p className="font-medium">Erreur d&lsquo;approbation:</p>
            <p className="text-sm">{approveError.message}</p>
          </Alert>
        )}
        
        {buyHash && (
          <Alert className="mb-2 bg-blue-50 text-blue-700">
            <p className="font-medium">Achat Transaction Hash:</p>
            <p className="text-sm break-all">{buyHash}</p>
          </Alert>
        )}
        {isBuyConfirming && (
          <Alert className="mb-2 bg-yellow-50 text-yellow-700">
            <p className="font-medium flex items-center">
              <span className="mr-2 animate-spin">⟳</span>
              En attente de confirmation de l&lsquo;achat...
            </p>
          </Alert>
        )}
        {isBuyConfirmed && (
          <Alert className="mb-2 bg-green-50 text-green-700">
            <p className="font-medium flex items-center">
              <span className="mr-2">✓</span>
              Achat confirmé
            </p>
          </Alert>
        )}
        {buyError && (
          <Alert className="mb-2 bg-red-50 text-red-700">
            <p className="font-medium">Erreur d&lsquo;achat:</p>
            <p className="text-sm">{buyError.message}</p>
          </Alert>
        )}
      </div>

      <div className="pt-2">
        <div className="flex flex-row gap-2 items-center">
          <h3 className="text-base font-semibold whitespace-nowrap">Acheter des parts:</h3>
          <div className="flex-1 max-w-[200px]">
            <div className="relative">
              <Input
                id="buyAmount"
                type="number"
                value={buyAmount}
                onChange={(e) => setBuyAmount(e.target.value)}
                className="w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                placeholder="50"
                min="0"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <span className="text-gray-500 text-xs">USDC</span>
              </div>
            </div>
          </div>
          <div className="flex-none">
            <Button 
              onClick={handleApproveAndBuyTokens}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 text-base font-medium transition-all duration-200 h-[38px]"
              disabled={isApprovePending || isBuyPending || buyAmount === "0"}
            >
              {isApprovePending ? (
                <span className="flex items-center justify-center">
                  <span className="mr-1 animate-spin">⟳</span> Approbation...
                </span>
              ) : isBuyPending ? (
                <span className="flex items-center justify-center">
                  <span className="mr-1 animate-spin">⟳</span> Achat...
                </span>
              ) : (
                'Acheter'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ApproveAndBuy;