'use client';
import { USDC_ADDRESS } from '@/constants'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { config } from '@/utils/wagmi'
import Image from 'next/image'
import Link from 'next/link'

import { useAccount } from 'wagmi'
import { getBalance } from 'wagmi/actions';
import { formatUnits } from 'viem';
import { GetBalanceReturnType, type GetBalanceParameters } from '@wagmi/core'
import { useEffect } from 'react';
import { useState } from 'react';
const Navbar = () => {
  const { address } = useAccount();

  //Fetch USDC balance fr the connected account
  const [balance, setBalance] = useState<bigint>(BigInt(0));

  useEffect(() => {
    const fetchBalance = async () => {
      const balance:GetBalanceReturnType = await getBalance(config, {
        address: address as `0x${string}`,
        token: USDC_ADDRESS
      })
      setBalance(balance.value);
    }
    fetchBalance();
  }, [address]);

  console.log(balance);

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
      </div>
      <div className="flex items-center space-x-8">
        <h2>
          <span className="text-gray-700 hover:text-gray-900">
            {formatUnits(balance, 6)} <Image
            src="/images/usdc.png"
            width={20}
            height={20}
            alt="Picture of the author"
          />
          </span>
        </h2>
        
      </div>


      {/* Connect Button */}
      <div><ConnectButton showBalance={true} /></div>
    </nav>
  )
}

export default Navbar 