"use client"

import React from 'react'
import { useSession, signIn, signOut } from "next-auth/react"
import { useRouter } from 'next/navigation'

const Page = () => {
  const { data: session } = useSession()

  if (session) {
    const router = useRouter()
    router.push('/')
  }

  return (
    <div className='flex flex-col h-[100vh] justify-center items-center min-h-screen bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] relative h-full w-full bg-slate-950 text-white flex flex-col gap-9 justify-end'>

      <h3 className='flex items-center justify-start font-bold text-4xl'>Login/Signup To Get Started</h3>

      <div className='flex flex-col'>

        <button type="button" className="text-white bg-[#3b5998] hover:bg-[#3b5998]/90 focus:ring-4 focus:outline-none focus:ring-[#3b5998]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-[#3b5998]/55 me-2 mb-2 flex gap-2 justify-around w-56">
          <img src="/facebook.svg" alt="" width={10} height={20} className='invert' />
          <span> Sign in with Facebook </span>
        </button>
        <button type="button" className="text-white bg-[#1da1f2] hover:bg-[#1da1f2]/90 focus:ring-4 focus:outline-none focus:ring-[#1da1f2]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-[#1da1f2]/55 me-2 mb-2 flex gap-2 justify-around w-56">
          <img src="/twitter.svg" alt="" width={24} height={24} className='invert' />
          <span> Sign in with Twitter </span>
        </button>
        <button type="button" className="text-white bg-[#24292F] hover:bg-[#24292F]/90 focus:ring-4 focus:outline-none focus:ring-[#24292F]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-gray-500 dark:hover:bg-[#050708]/30 me-2 mb-2 flex gap-2 justify-around w-56" onClick={() => signIn("github")}>
          <img src="github.svg" alt="" width={24} height={24} className='invert' />
          <span> Sign in with Github </span>
        </button>
        <button type="button" className="text-white bg-[#4285F4] hover:bg-[#4285F4]/90 focus:ring-4 focus:outline-none focus:ring-[#4285F4]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-[#4285F4]/55 me-2 mb-2 flex gap-2 w-56 justify-around" onClick={() => signIn("google")}>
          <img src="/google.svg" alt="" width={24} height={24} className='invert' />
          <span> Sign in with Google </span>
        </button>
        <button type="button" className="text-white bg-[#050708] hover:bg-[#050708]/90 focus:ring-4 focus:outline-none focus:ring-[#050708]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-[#050708]/50 dark:hover:bg-[#050708]/30 me-2 mb-2 flex justify-around gap-2 w-56">
          <img src="/apple.svg" alt="" width={24} height={24} className='invert' />
          <span> Sign in with Apple </span>
        </button>
      </div>
    </div>
  )
}

export default Page
