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
  const {isConnected, address } = useAccount();
  //Fetch USDC balance fr the connected account
  const [balance, setBalance] = useState<bigint>(BigInt(0));
  const fetchBalance = async () => {
    if (isConnected) {
      const balance:GetBalanceReturnType = await getBalance(config, {
        address: address as `0x${string}`,
        token: USDC_ADDRESS
      })
      setBalance(balance.value);
    }
  }
 
  const { data: ownerAddress, refetch:refetchOwner} = useReadContract({
    address: PROJECT_FACTORY_CONTRACT_ADDRESS,
    abi: PROJECT_FACTORY_ABI,
    functionName: "owner",
    account:address
  });
  const isOwner = ownerAddress && ownerAddress === address ? true : false;

  useEffect(() => {
    fetchBalance();
    refetchOwner();
  }, [address]);

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-white shadow-md">
      {/* Logo */}
      <div className="flex items-center">
        <Link href="/">
          <Image
            src="/logo.png" // Make sure to add your logo in the public folder
            alt="Logo"
            width={120}
            height={40}
            className="cursor-pointer"
          />
        </Link>
      </div>

      {/* Navigation Menu */}
      <div className="flex items-center space-x-8">
        <Link href="/" className="text-gray-700 hover:text-gray-900">
          Home
        </Link>
        <Link href="/services" className="text-gray-700 hover:text-gray-900">
          Services
        </Link>
        <Link href="/about" className="text-gray-700 hover:text-gray-900">
          About
        </Link>
        {isConnected && isOwner && (
          <Link href="/admin" className="text-gray-700 hover:text-gray-900">
            Administration
          </Link>
        )}
      </div>
      {isConnected && (<div className="flex items-center space-x-8">
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