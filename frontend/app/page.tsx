'use client';
import Projects from "@/components/shared/Projects";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { useAccount } from "wagmi";

export default function Home() {

  const { isConnected } = useAccount();

  return (
    <div className="p-5">
        <Projects />
    </div>
  );
}