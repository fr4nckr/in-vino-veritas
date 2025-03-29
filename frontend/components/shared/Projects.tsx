'use client'; 
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { publicClient } from "@/utils/client";
import { parseAbiItem } from 'viem'
import ProjectDetails from "./ProjectDetails";
// Define a type for the job structure
type Project = {
  projectAddress: `0x${string}` | undefined;
  offChainValue: bigint | undefined;
};
const Projects = () => {
    const {address} = useAccount();

    // Use the Project type with useState
    const [projects, setProjects] = useState<Project[]>([]);
    const getEvents = async () => {
      const getProjectAdded = publicClient.getLogs({
        event: parseAbiItem('event ProjectDeployed(address projectAddress, uint offChainValue)'),
        fromBlock: BigInt(0),
        toBlock: BigInt(1000)
      });
       
      const [projectAddedLogs] = await Promise.all([
        getProjectAdded
      ]);

      const allProjects = projectAddedLogs.map((projectAdded) => {
        return {
          projectAddress: projectAdded.args.projectAddress,
          offChainValue: projectAdded.args.offChainValue
        };
      });

      setProjects(allProjects);
    };
    

    console.log(projects);

    useEffect(() => {
      const getAllEvents = async() => {
        if (address) {
          await getEvents()
        }
      }
      getAllEvents()
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
  