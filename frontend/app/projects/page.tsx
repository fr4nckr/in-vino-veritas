'use client';
import Projects from "@/components/shared/Projects";
import { useAccount } from "wagmi";
export default function ProjectsPage() {
  const { isConnected } = useAccount();
  return (
    <div>
      {isConnected && (
        <div>
          <Projects />
        </div>
      )}
      {!isConnected && (
        <div className="p-5">
          <p>Veuillez vous connecter pour accéder à cette page</p>
        </div>
      )}
   </div>
  );
}
