'use client';
import { PROJECT_FACTORY_CONTRACT_ADDRESS, PROJECT_FACTORY_ABI, USDC_ADDRESS } from '@/constants'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { config } from '@/utils/wagmi'
import Image from 'next/image'
import Link from 'next/link'

import { useAccount, useReadContract } from 'wagmi'
import { getBalance } from 'wagmi/actions';
import { formatUnits } from 'viem';
import { GetBalanceReturnType } from '@wagmi/core'
import { useEffect } from 'react';
import { useState } from 'react';

const Navbar = () => {
  
  //Fetch USDC balance fr the connected account
  const [balance, setBalance] = useState<bigint>(BigInt(0));
  const { address, isConnected } = useAccount();
  const { data: ownerAddress, refetch:refetchOwner} = useReadContract({
    address: PROJECT_FACTORY_CONTRACT_ADDRESS,
    abi: PROJECT_FACTORY_ABI,
    functionName: "owner",
    account:address
  });
  const isOwner = ownerAddress && ownerAddress === address ? true : false;
  useEffect(() => {
    const fetchBalance = async () => {
      if (address) {
        const balance:GetBalanceReturnType = await getBalance(config, {
          address: address as `0x${string}`,
          token: USDC_ADDRESS
        })
        setBalance(balance.value);
      }
    }
    fetchBalance();
    refetchOwner();
  }, [address,refetchOwner]);

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-white shadow-md">
      {/* Logo */}
      <div className="flex items-center">
        <Link href="/">
          <Image
            src="/images/logo.png" // Make sure to add your logo in the public folder
            alt="Logo"
            width={120}
            height={40}
            className="cursor-pointer"
          />
        </Link>
      </div>

      {/* Navigation Menu */}
      <div className="flex items-center justify-center space-x-8 flex-1">
        <Link href="/" className="text-gray-700 hover:text-gray-900 text-lg font-medium drop-shadow-sm">
          Home
        </Link>
        <Link href="/projects" className="text-gray-700 hover:text-gray-900 text-lg font-medium drop-shadow-sm">
          Projects
        </Link>
        {isConnected && isOwner && (
          <Link href="/admin" className="text-gray-700 hover:text-gray-900 text-lg font-medium drop-shadow-sm">
            Administration
          </Link>
        )}
        <Link href="/about" className="text-gray-700 hover:text-gray-900 text-lg font-medium drop-shadow-sm">
          About
        </Link>
      </div>
      {isConnected && (<div className="flex items-center space-x-8 mr-6">
            {formatUnits(balance, 6)} &nbsp; <Image
            src="/images/usdc.png"
            width={20}
            height={20}
            alt="Picture of the author"
          />
        </div>)}
    
      {/* Connect Button */}
      <div><ConnectButton showBalance={true} /></div>
    </nav>
  )
}

export default Navbar 