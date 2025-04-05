'use client';
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract} from 'wagmi';
import { PROJECT_CONTRACT_ABI } from '@/constants';
import { multicall } from 'viem/actions';
import { publicClient } from '@/utils/client';
import { useEffect, useState } from 'react';
import { getToken, GetTokenReturnType } from '@wagmi/core'
import { config } from '@/utils/wagmi';
import { Alert } from '../ui/alert';
import { Button } from '../ui/button';
import { formatUnits } from 'viem/utils';
import { erc20Abi } from 'viem';
import ApproveAndBuy from './ApproveAndBuy';
import { Input } from '../ui/input';

const ProjectDetail = ({ isOwner, projectAddress }: { isOwner: boolean, projectAddress: string }) => {
  const { address } = useAccount();

  const [projectName, setProjectName] = useState<string | undefined>("");
  const [projectStatus, setProjectStatus] = useState<number | undefined>(0);
  const [ivv, setIvv] = useState<GetTokenReturnType | undefined>(undefined);
  const [projectValue, setProjectValue] = useState<string>("0");
  const [investorStatus, setInvestorStatus] = useState<number | undefined>(0);

  const { data: ivvBalance, refetch: refetchIvvBalance} = useReadContract({
    address: ivv?.address as `0x${string}`,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [address as `0x${string}`]
  });

  const { data: projectIvvBalance, refetch: refetchProjectIvvBalance} = useReadContract({
    address: ivv?.address as `0x${string}`,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [projectAddress as `0x${string}`]
  });

  const { data: hash, error, writeContract } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const handleStartProjectSale = async () => {
    writeContract({
      address: projectAddress as `0x${string}`,
      abi: PROJECT_CONTRACT_ABI,
      functionName: "startProjectSale",
      args: [],
      account: address
    });
  };

  const handleEndProjectSale = async () => {
    writeContract({
      address: projectAddress as `0x${string}`,
      abi: PROJECT_CONTRACT_ABI,
      functionName: "endProjectSale",
      args: [],
      account: address
    });
  };

  const handleAskForRegistration = async () => {
    writeContract({
      address: projectAddress as `0x${string}`,
      abi: PROJECT_CONTRACT_ABI,
      functionName: "askForRegistration",
      args: [],
      account: address
    });
  };

  const [treasuryWallet, setTreasuryWallet] = useState<string>("");
  const withdrawUsdc = async () => {
    writeContract({
      address: projectAddress as `0x${string}`,
      abi: PROJECT_CONTRACT_ABI,
      functionName: "withdrawUsdc",
      args: [treasuryWallet],
      account: address
    });
  };
  
  useEffect(() => {
    const projectContract = {
      address: projectAddress as `0x${string}`,
      abi: PROJECT_CONTRACT_ABI, 
      account: address
    } as const;

    const getAllEvents = async() => {
      if(address && projectAddress) {
        const projectInformations = await multicall(publicClient, ({ 
          contracts: [
            {
              ...projectContract,
              functionName: 'projectName'
            },
            {
              ...projectContract,
              functionName: 'projectStatus'
            },
            {
              ...projectContract,
              functionName: 'IVV_TOKEN'
            },
            {
              ...projectContract,
              functionName: 'projectValue'
            }, 
            {
              ...projectContract,
              functionName: 'getInvestorStatus', 
              args: [address as `0x${string}`]
            }
          ],
          multicallAddress: '0xcA11bde05977b3631167028862bE2a173976CA11' 
        }));
        
        const ivvToken = await getToken(config, {
          address: projectInformations[2].result as `0x${string}`,
        });
    
        setProjectName(projectInformations[0].result as string);
        setProjectStatus(projectInformations[1].result as number);
        setIvv(ivvToken);
        setProjectValue(BigInt(projectInformations[3].result as bigint).toString());
        setInvestorStatus(projectInformations[4].result as number);

      }
    }
    getAllEvents();
  }, [address, projectAddress, projectStatus, isConfirmed]);

  const getStatusText = (status: number) => {
    switch(status) {
      case 0: return "À venir";
      case 1: return "En vente";
      case 2: return "Vendu";
      default: return "Inconnu";
    }
  };

  const getStatusColor = (status: number) => {
    switch(status) {
      case 0: return "bg-blue-100 text-blue-800";
      case 1: return "bg-green-100 text-green-800";
      case 2: return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getInvestorStatusText = (status: number) => {
    switch(status) {
      case 0: return "Non enregistré";
      case 1: return "En attente de validation";
      case 2: return "Validé";
      case 3: return "Refusé";
      default: return "Inconnu";
    }
  };

  const getInvestorStatusColor = (status: number) => {
    switch(status) {
      case 0: return "bg-blue-100 text-blue-800";
      case 1: return "bg-orange-100 text-orange-800";
      case 2: return "bg-green-100 text-green-800";
      case 3: return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Transaction Status Alerts */}
      <div className="p-4">
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
              En attente de confirmation...
            </p>
          </Alert>
        )}
        {isConfirmed && (
          <Alert className="mb-2 bg-green-50 text-green-700 border-green-200">
            <p className="font-medium flex items-center">
              <span className="mr-2">✓</span>
              Transaction confirmée
            </p>
          </Alert>
        )}
        {error && (
          <Alert className="mb-2 bg-red-50 text-red-700 border-red-200">
            <p className="font-medium">Erreur:</p>
            <p className="text-sm">{error ? error.message : ''}</p>
          </Alert>
        )}
      </div>

      {/* Project Information */}
      <div className="p-6">
        {/* First line: Project name, value, and status */}
        <div className="flex flex-wrap items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">{String(projectName || "Sans nom")}</h2>
          <div className="flex items-center gap-4">
            <p className="text-xl font-semibold text-gray-800">Valeur: <span className="text-2xl font-bold text-green-700">{projectValue} $</span></p>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(projectStatus || 0)}`}>
              {getStatusText(projectStatus || 0)}
            </span>
          </div>
        </div>

        {/* Token Information */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Informations sur le token associé au projet</h3>
          <div className="flex flex-wrap gap-6">
            <div>
              <p className="text-sm text-gray-600">Total Supply: {ivv?.totalSupply ? formatUnits(ivv.totalSupply.value, ivv?.decimals).toString() : '/'} {ivv?.symbol || '/'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Supply disponible à l&lsquo;achat : {projectIvvBalance ? formatUnits(projectIvvBalance as bigint, 18).toString() + ' ' + ivv?.symbol : '0'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Votre part: {ivvBalance ? formatUnits(ivvBalance as bigint, 18).toString() + ' $' + ivv?.symbol : '0'}</p>
            </div>
          </div>
        </div>

        {/* Investor Information */}
        {!isOwner && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold">Informations sur l&lsquo;investisseur</h3>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getInvestorStatusColor(investorStatus || 0)}`}>
              {getInvestorStatusText(investorStatus || 0)}
            </span>
          </div>
          
          <div className="mt-1">
            {/* Token Purchase Section */}
            {projectStatus === 1 && investorStatus === 2 && (
                <div className="w-full">
                  <ApproveAndBuy 
                    projectAddress={projectAddress} 
                    refetchIvvBalance={refetchIvvBalance}
                    refetchProjectIvvBalance={refetchProjectIvvBalance}
                  />
                </div>
            )}
            
            {!isOwner && investorStatus !== 2 && (
              <div className="p-3 bg-white rounded-lg shadow-sm">
                <p className="text-yellow-700">Vous ne pouvez pas acheter de parts car votre dossier n'a pas été validé.</p>
              </div>
            )}

            {isOwner && projectStatus !== 1 && (
              <div className="p-3 bg-white rounded-lg shadow-sm">
                <p className="text-yellow-700">Le projet n&lsquo;est pas en cours de vente</p>
              </div>
            )}

            {/* Registration Button */}
            {!isOwner && projectStatus !== 2 && investorStatus === 0 && (
              <div className="p-3 bg-white rounded-lg shadow-sm">
                <h4 className="text-md font-semibold mb-2 text-blue-700">Inscription requise pour participer</h4>
                <p className="text-sm text-gray-600 mb-3">Pour pouvoir participer dans ce projet, vous devez d'abord vous enregistrer.</p>
                <Button 
                  onClick={handleAskForRegistration}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition-colors"
                >
                  S&lsquo;enregistrer
                </Button>
              </div>
            )}
          </div>
        </div>
        )}
        {/* Action Buttons */}
        <div className="space-y-4">
          {/* Owner Actions */}
          {isOwner && projectStatus === 0 && (
            <div className="pt-4 border-t">
              <Button 
                onClick={handleStartProjectSale}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                Démarrer la vente
              </Button>
            </div>
          )}
          {isOwner && projectStatus === 1 && (
            <div className="pt-4 border-t">
              <Button 
                onClick={handleEndProjectSale}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
              >
                Clôturer la vente
              </Button>
            </div>
          )}
          {isOwner && projectStatus === 2 && (
            <div className="pt-4 border-t">
              <Input
                type="text"
                placeholder="Treasury wallet"
                value={treasuryWallet}
                onChange={(e) => setTreasuryWallet(e.target.value)}
              />

              <Button 
                onClick={withdrawUsdc}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
              >

                Collecter les fonds
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProjectDetail;