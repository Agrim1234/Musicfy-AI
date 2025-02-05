"use client"

import React from 'react'
import { useSession, signIn, signOut } from "next-auth/react"
import { useRouter } from 'next/navigation'
import Image from 'next/image'

const Page = () => {
  const { data: session } = useSession()
  const router = useRouter()

  if (session) {
    router.push('/')
  }

  return (
    <div className='flex flex-col h-[100vh] justify-center items-center min-h-screen bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] relative h-full w-full bg-slate-950 text-white flex flex-col gap-9 justify-end'>

      <h3 className='flex items-center justify-start font-bold text-4xl'>Login/Signup To Get Started</h3>

      <div className='flex flex-col'>
        <button type="button" className="text-white bg-[#24292F] hover:bg-[#24292F]/90 focus:ring-4 focus:outline-none focus:ring-[#24292F]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-gray-500 dark:hover:bg-[#050708]/30 me-2 mb-2 flex gap-2 justify-around w-56" onClick={() => signIn("github")}>
          <Image src="github.svg" alt="login method" width={24} height={24} className='invert' />
          <span> Sign in with Github </span>
        </button>
        <button type="button" className="text-white bg-[#4285F4] hover:bg-[#4285F4]/90 focus:ring-4 focus:outline-none focus:ring-[#4285F4]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-[#4285F4]/55 me-2 mb-2 flex gap-2 w-56 justify-around" onClick={() => signIn("google")}>
          <Image src="/google.svg" alt="login method" width={24} height={24} className='invert' />
          <span> Sign in with Google </span>
        </button>
      </div>
    </div>
  )
}

export default Page
