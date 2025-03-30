'use client';
import { useAccount} from 'wagmi';
import { PROJECT_CONTRACT_ABI } from '@/constants';
import { multicall } from 'viem/actions';
import { publicClient } from '@/utils/client';
import { useEffect, useState } from 'react';
import { getToken, GetTokenReturnType } from '@wagmi/core'
import { config } from '@/utils/wagmi';

const ProjectDetail = ({ projectAddress }: { projectAddress: `0x${string}` | undefined }) => {
  const { address } = useAccount();

  const projectContract = {
    address: projectAddress as `0x${string}`,
    abi: PROJECT_CONTRACT_ABI, 
    account: address
  } as const

  const [projectName, setProjectName] = useState<string | undefined>("");
  const [projectStatus, setProjectStatus] = useState<number | undefined>(0);
  const [ivv, setIvv] = useState<GetTokenReturnType | undefined>(undefined);
 
  useEffect(() => {
    const fetchData  = async () => {
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
            functionName: 'ivv'
          }
        ],
        multicallAddress: '0xcA11bde05977b3631167028862bE2a173976CA11' 
      }));
    
      const ivvToken = await getToken(config,{
        address: projectInformations[2].result as `0x${string}`,
      })

      setProjectName(projectInformations[0].result as string);
      setProjectStatus(projectInformations[1].result as number);
      setIvv(ivvToken);

    }

    fetchData();
   
  }, [address]);

  // console.log("projectName", projectName);
  // console.log("projectStatus", projectStatus);
  // console.log("ivv", ivv);
  
  // Determine the background color based on job status
  const bgColor = projectStatus === 0 ? 'bg-blue-100' : 'bg-red-100';

  return (
      <div className={`border rounded<lg p-4 mb-4 shadow-md ${bgColor}`}>
        <h2 className="text-xl font-semibold mb-2">{String(projectName || "No Description")}</h2>
        <p className="text-sm text-gray-600 mb-1"><strong>Status:</strong> {projectStatus === 0 ? 'Soon' : 'Closed'}</p>
        <p className="text-sm text-gray-600 mb-1"><strong>Total Supply:</strong> {ivv && ivv.totalSupply ? BigInt(ivv?.totalSupply.value).toString() : '/'}</p>
        <p className="text-sm text-gray-600 mb-1"><strong>IVV Token:</strong> ${ivv && ivv?.symbol}</p>
      </div>
  );
}

export default ProjectDetail;