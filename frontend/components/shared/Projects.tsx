'use client'; 
import { useAccount, useReadContract } from "wagmi";
import ProjectDetails from "./ProjectDetails";
import { PROJECT_FACTORY_ABI, PROJECT_FACTORY_CONTRACT_ADDRESS } from "@/constants";

const Projects = () => {
    const {address} = useAccount();
    const { data: ownerAddress} = useReadContract({
      address: PROJECT_FACTORY_CONTRACT_ADDRESS,
      abi: PROJECT_FACTORY_ABI,
      functionName: "owner",
      account:address
    });

    const { data: projects} = useReadContract({
      address: PROJECT_FACTORY_CONTRACT_ADDRESS,
      abi: PROJECT_FACTORY_ABI,
      functionName: "getAllProjects",
      args:[],
      account:address
    });
    
    const allProjects = projects as `0x${string}`[];
    const isOwner = ownerAddress && ownerAddress === address ? true : false;
    return (
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-8 text-gray-800 drop-shadow-sm text-center">Liste des projets InVinoVeritas</h2>
        <div className="flex flex-col space-y-6">
          {allProjects && allProjects.map((projectAddress, index) => (
            <div key={index} className="w-full border rounded-lg overflow-hidden shadow-md">
                {/* Left side - Project Details */}
                <ProjectDetails key={index + 'projects'} isOwner={isOwner} projectAddress={projectAddress} />
            </div>
          ))}
        </div>
      </div>
    );
  };
  export default Projects;
  