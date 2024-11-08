import React from 'react'
import { ModeToggle } from './mode-toggle'
import { IconLogo } from './ui/icons'
import { cn } from '../lib/utils'
import HistoryContainer from './history-container'
import Link from 'next/link'

export const Header: React.FC = async () => {
  return (
    <header className="fixed w-full p-1 md:p-2 flex justify-between items-center z-10 backdrop-blur md:backdrop-blur-none bg-background/80 md:bg-transparent">
      <div className="flex items-center gap-4">
        <a href="/">
          <IconLogo className={cn('w-5 h-5')} />
          <span className="sr-only">Morphic</span>
        </a>
        <nav className="flex gap-4">
          <Link
            href="/search"
            className="text-sm font-medium hover:text-primary"
          >
            Search
          </Link>
          <Link href="/chat" className="text-sm font-medium hover:text-primary">
            Chat
          </Link>
        </nav>
      </div>
      <div className="flex gap-0.5">
        <ModeToggle />
        <HistoryContainer location="header" />
      </div>
    </header>
  )
}

export default Header
