'use client'; 
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { publicClient } from "@/utils/client";
import { parseAbiItem } from 'viem'
import ProjectDetails from "./ProjectDetails";
import { PROJECT_FACTORY_CONTRACT_ADDRESS } from "@/constants";
// Define a type for the job structure
type Project = {
  projectAddress: `0x${string}` | undefined;
  projectValue: bigint | undefined;
};
const Projects = () => {
    const {address} = useAccount();

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
      console.log("projectAddedLogs" ,projectAddedLogs);
       
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
      <>
        <h2 className="text-lg font-bold mb-2">Project list</h2>
        {projects.map((project, index) => (
          <ProjectDetails key={index} projectAddress={project.projectAddress} />
        ))}
      </>
      
    );
  };
  export default Projects;
  