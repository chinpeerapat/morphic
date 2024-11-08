import Link from 'next/link'
import { Button } from '../components/ui/button'
import { IconLogo } from '../components/ui/icons'
import { Search, MessageSquare } from 'lucide-react'

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="text-center space-y-8">
        <div className="flex items-center justify-center space-x-2">
          <IconLogo className="w-12 h-12" />
          <h1 className="text-4xl font-bold">Morphic</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-[600px] mx-auto">
          A fully open-source AI-powered answer engine with a generative UI.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/search">
            <Button size="lg" className="gap-2">
              <Search size={20} />
              Search with AI
            </Button>
          </Link>
          <Link href="/chat">
            <Button size="lg" variant="outline" className="gap-2">
              <MessageSquare size={20} />
              Chat with AI
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
