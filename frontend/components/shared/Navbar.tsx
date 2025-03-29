'use client';
import { USDC_ADDRESS } from '@/constants'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { config } from '@/utils/wagmi'
import Image from 'next/image'
import Link from 'next/link'

import { useAccount } from 'wagmi'
import { getBalance } from 'wagmi/actions';
const Navbar = () => {
  const { address } = useAccount();

  //Fetch USDC balance fr the connected account
  const balance = getBalance(config, {
    address: address as `0x${string}`,
    token: USDC_ADDRESS, 
  })

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

      {/* Connect Button */}
      <div><ConnectButton showBalance={true} /></div>
    </nav>
  )
}

export default Navbar 