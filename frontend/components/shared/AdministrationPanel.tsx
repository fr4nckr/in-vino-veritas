'use client';
import { useEffect, useState } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt} from 'wagmi';
import { PROJECT_FACTORY_CONTRACT_ADDRESS, PROJECT_FACTORY_ABI, PROJECT_CONTRACT_ABI } from '@/constants';
import { Alert } from '../ui/alert';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { publicClient } from '@/utils/client';
import { parseAbiItem } from 'viem';

type Investor = {
  investorAddress: `0x${string}` | undefined;
  investorStatus: number | undefined;
}
const AdministrationPanel = () => {

  const [projectName, setProjectName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [projectValue, setProjectValue] = useState(0);
  const [investorsByProject, setInvestorsByProject] = useState<Map<`0x${string}`, Investor[]>>(new Map());
  const { address } = useAccount();
  
  const { data: hash, error, isPending, writeContract } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
  useWaitForTransactionReceipt({
    hash, 
  })

  const handleCreateProject = async() => { 
      writeContract({
          address: PROJECT_FACTORY_CONTRACT_ADDRESS,
          abi: PROJECT_FACTORY_ABI,
          functionName: "createProject",
          account: address,
          args: [tokenSymbol, projectName, projectValue]
      })
  }

  const { data: projects, refetch: refetchProjects} = useReadContract({
    address: PROJECT_FACTORY_CONTRACT_ADDRESS,
    abi: PROJECT_FACTORY_ABI,
    functionName: "getAllProjects",
    args:[],
    account:address
  });
  const allProjects = projects as `0x${string}`[];
    
 
  useEffect(() => {
      if(allProjects && allProjects.length > 0) {
        const fetchData = async () => {
          const localInvestorsByProject = new Map<`0x${string}`, Investor[]>();
          for(let i = 0; i < allProjects.length; i++) {
            const projectAddress = allProjects[i];
            try {
              const investorRegisteredLogs = await publicClient.getLogs({
                address: projectAddress as `0x${string}`,
                event: parseAbiItem('event InvestorRegistered(address investorAddress)'),
                fromBlock: 0n,
                toBlock: 'latest'
              });
                
                // Initialize the array for this project if it doesn't exist
                if (!localInvestorsByProject.has(projectAddress)) {
                  localInvestorsByProject.set(projectAddress, []);
                }
                
                // Process each investor
                for (const log of investorRegisteredLogs) {
                  const investorAddress = log.args.investorAddress;
                  
                  // Get investor status
                  const investorStatus = await publicClient.readContract({
                    address: projectAddress as `0x${string}`,
                    abi: PROJECT_CONTRACT_ABI,
                    functionName: "getInvestorStatus",
                    args: [investorAddress],
                  });
                  
                  // Add investor to the project map
                  const projectInvestors = localInvestorsByProject.get(projectAddress) || [];
                  projectInvestors.push({
                    investorAddress: investorAddress,
                    investorStatus: investorStatus as number
                  });
                  localInvestorsByProject.set(projectAddress, projectInvestors);
                }
              } catch (error) {
                console.error(`Error processing project ${projectAddress}:`, error);
              }
            }
          setInvestorsByProject(localInvestorsByProject);
        }
        fetchData();
      }
      refetchProjects();
    }, [address, allProjects, refetchProjects, isConfirmed]);
  
  const handleValidateInvestor = async(projectAddress: `0x${string}`, investorAddress: `0x${string}`) => { 
    writeContract({
      address: projectAddress,
      abi: PROJECT_CONTRACT_ABI,
      functionName: "validateInvestor",
      account: address,
      args: [investorAddress]
    });
  };
  
  const handleDenyInvestor = async(projectAddress: `0x${string}`, investorAddress: `0x${string}`) => { 
    writeContract({
      address: projectAddress,
      abi: PROJECT_CONTRACT_ABI,
      functionName: "denyInvestor",
      account: address,
      args: [investorAddress]
    });
  };
  
  // Helper function to get status text
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
      case 2: return "bg-gray-100 text-gray-800";
      case 3: return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex flex-col w-full gap-8 p-6">
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
      {/* Project Creation Section */}
      <div className="border rounded-lg p-6 shadow-md">
        <h2 className="text-2xl font-bold mb-6">Création d&lsquo;un nouveau projet</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="projectName" className="block text-sm font-medium text-gray-700">
              Nom du projet foncier
            </Label>
            <Input
              type="text"
              id="projectName"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <Label htmlFor="tokenSymbol" className="block text-sm font-medium text-gray-700">
              Symbole du token
            </Label>
            <Input
              type="text"
              id="tokenSymbol"
              value={tokenSymbol}
              onChange={(e) => setTokenSymbol(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <Label htmlFor="projectValue" className="block text-sm font-medium text-gray-700">
              Valeur du projet (en USD)
            </Label>
            <Input
              type="number"
              id="projectValue"
              value={projectValue}
              onChange={(e) => setProjectValue(Number(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={isPending}
            onClick={handleCreateProject}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isPending ? 'Creating...' : 'Create Project'}
          </Button>
        </div>
      </div>

      {/* Projects List Section */}
      <div className="border rounded-lg p-6 shadow-md">
        <h2 className="text-2xl font-bold mb-6">Gestion des investisseurs (KYC)</h2>
        {allProjects && allProjects.map((projectAddress, index) => (
          <div key={index} className="mb-8 border rounded-lg p-4 shadow-md">
            <h3 className="text-xl font-semibold mb-4">Projet foncier {projectAddress}</h3>
            {projectAddress && investorsByProject && investorsByProject.get(projectAddress) && (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-2 px-4 text-left">Addresse de l&lsquo;investisseur</th>
                      <th className="py-2 px-4 text-left">Statut</th>
                      <th className="py-2 px-4 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {investorsByProject.get(projectAddress)?.map((investor, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="py-2 px-4">
                          <span className="font-mono text-sm">{investor.investorAddress}</span>
                        </td>
                        <td className="py-2 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${getInvestorStatusColor(investor.investorStatus || 0)}`}>
                            {getInvestorStatusText(investor.investorStatus || 0)}
                          </span>
                        </td>
                        <td className="py-2 px-4">
                          <div className="flex space-x-2">
                            <Button 
                              onClick={() => handleValidateInvestor(projectAddress as `0x${string}`, investor.investorAddress as `0x${string}`)}
                              className="bg-green-600 hover:bg-green-700"
                              disabled={investor.investorStatus != 1}
                            >
                              Valider
                            </Button>
                            <Button 
                              onClick={() => handleDenyInvestor(projectAddress as `0x${string}`, investor.investorAddress as `0x${string}`)}
                              className="bg-red-600 hover:bg-red-700"
                              disabled={investor.investorStatus != 1}
                            >
                              Refuser
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}


export default AdministrationPanel;