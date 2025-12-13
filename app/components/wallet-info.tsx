"use client"

import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { LAMPORTS_PER_SOL } from "@solana/web3.js"
import { useEffect, useState } from "react"
import { Wallet } from "lucide-react"

export function WalletInfo() {
  const { connection } = useConnection()
  const { publicKey } = useWallet()
  const [balance, setBalance] = useState<number | null>(null)

  useEffect(() => {
    if (!publicKey) {
      setBalance(null)
      return
    }

    // Get initial balance
    connection.getBalance(publicKey).then((balance) => {
      setBalance(balance / LAMPORTS_PER_SOL)
    })

    // Subscribe to balance changes
    const subscriptionId = connection.onAccountChange(
      publicKey,
      (accountInfo) => {
        setBalance(accountInfo.lamports / LAMPORTS_PER_SOL)
      }
    )

    return () => {
      connection.removeAccountChangeListener(subscriptionId)
    }
  }, [publicKey, connection])

  if (!publicKey || balance === null) {
    return null
  }

  return (
    <div className="flex items-center gap-2 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 px-3 py-1.5 rounded-full">
      <Wallet className="w-4 h-4 text-purple-500" />
      <span className="text-sm font-medium text-foreground">
        {balance.toFixed(2)} SOL
      </span>
    </div>
  )
}

