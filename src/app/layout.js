import './globals.css'

import 'react-toastify/dist/ReactToastify.css';

import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] })

function Header() {
  return (
    <header className="bg-tangz-blue dark:bg-tangz-blue-darker py-4">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
        <div className="relative flex items-center justify-start md:justify-center py-5 gap-4 lg:justify-between">
          <div className="left-0 flex-shrink-0 lg:static">
            <a href="https://wildtangz.com">
              <span className="sr-only">Wild Tangz</span>
              <img className="h-8 w-auto rounded-lg" src="/logo.jpg" alt="Wild Tangz" />
            </a>
          </div>
          <div className="flex-shrink-0">
            <h1 className="text-2xl text-white font-custom-titles">Recursive Ordinals Builder</h1>
          </div>
          <div className="flex-shrink-0">
          </div>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
        <div className="flex flex-wrap md:flex-nowrap justify-between border-t border-gray-200 py-8 gap-4 text-center text-sm text-gray-500">
          <span className="block sm:inline mx-auto md:mx-0">&copy; 2023 Wild Tangz. All rights reserved.</span>
          <span className="block sm:inline mx-auto md:mx-0">Questions? Get in touch via <a href="https://discord.gg/wildtangz" className="text-tangz-blue hover:underline">Wild Tangz Discord</a></span>
        </div>
      </div>
    </footer>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  )
}
