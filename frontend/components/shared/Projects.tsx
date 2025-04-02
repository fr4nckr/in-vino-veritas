'use client'; 
import { useState, useEffect } from "react";
import { useAccount, useReadContract } from "wagmi";
import { publicClient } from "@/utils/client";
import { parseAbiItem } from 'viem'
import ProjectDetails from "./ProjectDetails";
import { PROJECT_FACTORY_ABI, PROJECT_FACTORY_CONTRACT_ADDRESS } from "@/constants";
import RegisterInvestors from "./RegisterInvestors";
// Define a type for the job structure
type Project = {
  projectAddress: `0x${string}` | undefined;
  projectValue: bigint | undefined;
};
const Projects = () => {
    const {address} = useAccount();
    const { data: ownerAddress} = useReadContract({
      address: PROJECT_FACTORY_CONTRACT_ADDRESS,
      abi: PROJECT_FACTORY_ABI,
      functionName: "owner",
      account:address
    });

    const isOwner = ownerAddress && ownerAddress === address ? true : false;
    // Use the Project type with useState
    const [projects, setProjects] = useState<Project[]>([]);
    const getEvents = async () => {
      const getProjectAdded = publicClient.getLogs({
        address: PROJECT_FACTORY_CONTRACT_ADDRESS,
        event: parseAbiItem('event ProjectDeployed(address projectAddress, uint projectValue)'),
        fromBlock: 0n,
        toBlock: 'latest'
      });
     
      const [projectAddedLogs] = await Promise.all([
        getProjectAdded
      ]);
       
      const allProjects = projectAddedLogs.map((projectAdded) => {
        return {
          projectAddress: projectAdded.args.projectAddress,
          projectValue: projectAdded.args.projectValue
        };
      });

      setProjects(allProjects);
    };

    useEffect(() => {
      const getAllEvents = async() => {
        if (address) {
          await getEvents();
        }
      }
      getAllEvents();
    }, [address])

    return (
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-8">Projets Disponibles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <div key={index}>
              <ProjectDetails key={index + 'projects'} isOwner={isOwner} projectAddress={project.projectAddress} />
              <RegisterInvestors key={index+'register'} projectAddress={project.projectAddress} />
            </div>
          ))}
        </div>
      </div>
    );
  };
  export default Projects;
  