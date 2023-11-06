import './globals.scss'
import { Providers } from './providers'

import { Inter } from 'next/font/google'
import { Roboto_Mono } from 'next/font/google'

// If loading a variable font, you don't need to specify the font weight
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})


// const roboto_mono = Roboto_Mono({
//   subsets: ['latin'],
//   display: 'swap',
//   variable: '--font-roboto-mono',
// })
 

export const metadata = {
  title: 'Peach embarqué',
  description: 'Passez vos études',
}

export default function RootLayout({ children }) {
  return (

    <html lang="en" className={inter.variable + " light "}>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}

