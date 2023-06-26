import './globals.css'

import 'react-toastify/dist/ReactToastify.css';

import Image from 'next/image';

import { Inter } from 'next/font/google';

import { TermsAndConditionsModal } from "../components/terms.jsx";

const inter = Inter({ subsets: ['latin'] })

const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000;

function Header() {
  return (
    <header className="bg-tangz-blue dark:bg-tangz-blue-darker py-4">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8">
        <div className="relative flex items-center justify-start md:justify-center py-5 gap-4 lg:justify-between">
          <div className="left-0 flex-shrink-0 lg:static">
            <a href="https://wildtangz.com">
              <span className="sr-only">Wild Tangz</span>
              <Image className="h-8 w-auto rounded-lg" src="/logo.jpg" alt="Wild Tangz" width={32} height={32} />
            </a>
          </div>
          <div className="flex-shrink-0">
            <h1 className="text-2xl text-white font-custom-titles w-72 md:w-full">Recursive Ordinals Builder</h1>
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
        <main className="pb-8">
          <TermsAndConditionsModal id="btc-toolkit-info-firsttimer" header="Please Read Carefully" confirmation="I Understand" expiration={TWO_WEEKS_MS}>
            <span>The following interface attempts its best to render a preview of your recursive Ordinal.  Please, CAREFULLY inspect the code you enter below.  There are no refunds once orders are processed.</span>
          </TermsAndConditionsModal>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
