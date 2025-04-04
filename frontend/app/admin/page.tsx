'use client';
import AdministrationPanel from "@/components/shared/AdministrationPanel";
import { PROJECT_FACTORY_CONTRACT_ADDRESS, PROJECT_FACTORY_ABI } from "@/constants";
import { useEffect } from "react";
import { useAccount, useReadContract } from "wagmi";

export default function Admin() {
  const { address } = useAccount();
  const { data: ownerAddress, refetch} = useReadContract({
    address: PROJECT_FACTORY_CONTRACT_ADDRESS,
    abi: PROJECT_FACTORY_ABI,
    functionName: "owner",
    account:address
  });
  useEffect(() => {
    refetch();
  }, [address, refetch]);
  const isOwner = ownerAddress && ownerAddress === address ? true : false;
  return (
    <div className="p-5">
      {isOwner && (
        <>
          <AdministrationPanel />
        </>
      )}
      {!isOwner && (
        <div className="p-5">
          <p>Vous n&lsquo;êtes pas autorisé à accéder à cette page</p>
        </div>
      )}
    </div>
  );
}