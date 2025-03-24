import { ModeToggle } from '@/components/global/mode-toggle'
import { UserButton } from '@clerk/nextjs'
import { currentUser, User } from '@clerk/nextjs/server'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

type Props = {
  user?: null | User
}


const navItems = [
  { label: 'Features', href: '#features' },
  { label: 'About', href: '#about' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Contact', href: '#contact' }
];

const Navigation = async ({ user }: Props) => {

  const clrak_user = await currentUser();
  return (
    <div className="fixed top-0 right-0 left-0 p-4 flex items-center justify-between z-10">
      <aside className="flex items-center gap-2">
        <Image
          src={'./assets/nrs.svg'}
          width={40}
          height={40}
          alt="nrs logo"
          style={{ width: "auto", height: "auto" }}
        />
        <span className="text-xl font-bold"> NRS-Studio.</span>
      </aside>
      <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-background/80 backdrop-blur-lg rounded-full border border-border px-4 py-2 shadow-lg hidden md:block">
        <ul className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <aside className="flex gap-2 items-center">

        {(clrak_user) && <>
          <Link
            href={'/agency'}
            className="bg-zinc-900 text-cyan-400 p-2 px-4 rounded-md hover:bg-gray-900/90"
          ><div className='bg-gradient-to-r from-primary to-cyan-100 text-transparent bg-clip-text relative'>

              Get started ▶
            </div>


          </Link>
        </> || <><Link
          href={'/agency'}
          className="bg-primary text-white p-2 px-4 rounded-md hover:bg-primary/80"
        >
          Login
        </Link>

            <Link
              href={'/sign-up'}
              className="bg-purple-950 text-white p-2 px-4 rounded-md hover:bg-purple-950/80"
            >   SignUp
            </Link></>}
        <UserButton />
        <ModeToggle />
      </aside>
    </div>
  )
}

export default Navigation
