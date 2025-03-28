'use client';
import { formatEther } from 'viem';
import { useEffect } from 'react';
import { type BaseError, useAccount, useReadContract } from 'wagmi';
import { PROJECT_CONTRACT_ABI } from '@/constants';



const ProjectDetail = ({ projectAddress }: { projectAddress: `0x${string}` | undefined }) => {
  const { address } = useAccount();

  const { data: projectName } = useReadContract({
    address: projectAddress as `0x${string}`,
    abi: PROJECT_CONTRACT_ABI,
    functionName: 'projectName',
    account: address,
  })

  const { data: projectStatus} = useReadContract({
    address: projectAddress as `0x${string}`,
    abi: PROJECT_CONTRACT_ABI,
    functionName: 'projectStatus',
    account: address,
  })

  const { data: ivvToken} = useReadContract({
    address: projectAddress as `0x${string}`,
    abi: PROJECT_CONTRACT_ABI,
    functionName: 'ivv',
    account: address,
  })

  // Determine the background color based on job status
  const bgColor = projectStatus == 0 ? 'bg-blue-100' : 'bg-red-100';

  return (
    <div className={`border rounded-lg p-4 mb-4 shadow-md ${bgColor}`}>
      <h2 className="text-xl font-semibold mb-2">{String(projectName || "No Description")}</h2>
      <h2 className="text-xl font-semibold mb-2">{ivvToken && ivvToken.symbol ?}</h2>
      <p className="text-sm text-gray-600 mb-1"><strong>Status:</strong> {projectStatus === 0 ? 'Soon' : 'Closed'}</p>
    </div>
  );
}

export default ProjectDetail;