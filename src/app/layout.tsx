import './globals.css'

import { ReactNode } from 'react'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Video 2 Post',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-zinc-100 text-black`}>
        {children}
      </body>
    </html>
  )
}
