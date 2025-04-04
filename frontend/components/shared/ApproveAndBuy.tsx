'use client';
import { PROJECT_CONTRACT_ABI, USDC_ADDRESS } from '@/constants';
import { useEffect, useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Alert } from '../ui/alert';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { parseUnits } from 'viem/utils';
import { erc20Abi } from 'viem';

const ApproveAndBuy = ({ projectAddress }: {projectAddress: string }) => {
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
    console.log('approving token transfer');
    
    // First approve USDC spending
    writeUSDC({
      address: USDC_ADDRESS,
      abi: erc20Abi,
      functionName: 'approve',
      args: [projectAddress as `0x${string}`, parseUnits(buyAmount, 6)],
      account: address
    });
    
    // Note: The buy transaction will be triggered by the useEffect below when approval is confirmed
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
  }, [isApproveConfirmed, address, projectAddress, buyAmount, writeProject]);

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Transaction Status Alerts */}
      <div className="p-4">
        {approveHash && (
          <Alert className="mb-2 bg-blue-50 text-blue-700 border-blue-200">
            <p className="font-medium">Approval Transaction Hash:</p>
            <p className="text-sm break-all">{approveHash}</p>
          </Alert>
        )}
        {isApproveConfirming && (
          <Alert className="mb-2 bg-yellow-50 text-yellow-700 border-yellow-200">
            <p className="font-medium flex items-center">
              <span className="mr-2 animate-spin">⟳</span>
              En attente de confirmation de l&lsquo;approbation...
            </p>
          </Alert>
        )}
        {isApproveConfirmed && (
          <Alert className="mb-2 bg-green-50 text-green-700 border-green-200">
            <p className="font-medium flex items-center">
              <span className="mr-2">✓</span>
              Approbation confirmée
            </p>
          </Alert>
        )}
        {approveError && (
          <Alert className="mb-2 bg-red-50 text-red-700 border-red-200">
            <p className="font-medium">Erreur d&lsquo;approbation:</p>
            <p className="text-sm">{approveError.message}</p>
          </Alert>
        )}
        
        {buyHash && (
          <Alert className="mb-2 bg-blue-50 text-blue-700 border-blue-200">
            <p className="font-medium">Achat Transaction Hash:</p>
            <p className="text-sm break-all">{buyHash}</p>
          </Alert>
        )}
        {isBuyConfirming && (
          <Alert className="mb-2 bg-yellow-50 text-yellow-700 border-yellow-200">
            <p className="font-medium flex items-center">
              <span className="mr-2 animate-spin">⟳</span>
              En attente de confirmation de l&lsquo;achat...
            </p>
          </Alert>
        )}
        {isBuyConfirmed && (
          <Alert className="mb-2 bg-green-50 text-green-700 border-green-200">
            <p className="font-medium flex items-center">
              <span className="mr-2">✓</span>
              Achat confirmé
            </p>
          </Alert>
        )}
        {buyError && (
          <Alert className="mb-2 bg-red-50 text-red-700 border-red-200">
            <p className="font-medium">Erreur d&lsquo;achat:</p>
            <p className="text-sm">{buyError.message}</p>
          </Alert>
        )}
      </div>

      <div className="pt-4 border-t">
        <h3 className="text-lg font-semibold mb-2">Acheter des parts</h3>
        <div className="flex items-center gap-4">
          <Input
            type="number"
            value={buyAmount}
            onChange={(e) => setBuyAmount(e.target.value)}
            className="flex-1"
            placeholder="Montant en USDC"
            min="50"
          />
          <Button 
            onClick={handleApproveAndBuyTokens}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={isApprovePending || isBuyPending}
          >
            {isApprovePending ? 'Approbation...' : isBuyPending ? 'Achat...' : 'Acheter'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ApproveAndBuy;