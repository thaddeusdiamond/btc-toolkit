'use client';

import './globals.css'

import 'react-toastify/dist/ReactToastify.css';

import Image from 'next/image';

import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';

import { TermsAndConditionsModal } from "../components/terms.jsx";
import { SimpleButton } from '../components/widgets/buttons.jsx';
import { DEFAULT_PRICE, BTC_TO_SATS } from '../utils/price.js';

import { UserProvider, useUser } from '@auth0/nextjs-auth0/client';

const inter = Inter({ subsets: ['latin'] })

const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000;

function Header() {
  const { user, isLoading, _ } = useUser();
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
            <a class="text-gray-50 dark:text-gray-200 text-xs p-6">{user ? `Hi, ${user.name}! ` : ""}</a>
            <SimpleButton label={isLoading ? "..." : (user ? "Logout" : "Login")} onClick={() => window.location.replace(`/api/auth/${user ? "logout" : "login"}`)} active={!isLoading} extraClasses="outline outline-2"/>
          </div>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-7xl lg:px-8 border-t border-gray-200 w-full py-4 text-center text-sm text-gray-500">
        <div className="mx-auto mb-4 italic">
          Please note, we charge {DEFAULT_PRICE.toLocaleString()} sats ({DEFAULT_PRICE / BTC_TO_SATS} BTC) per inscription as a developer fee. Certain collections, such as the <a href="https://otternals.io/mint" target="_blank" className="text-tangz-blue hover:underline">Otternals</a>, may receive discounts on these costs.
        </div>
        <div className="flex flex-wrap md:flex-nowrap justify-between gap-4">
          <span className="block sm:inline mx-auto md:mx-0">&copy; 2023 Wild Tangz. All rights reserved.</span>
          <span className="block sm:inline mx-auto md:mx-0">Questions? Get in touch via <a href="https://discord.gg/wildtangz" target="_blank" className="text-tangz-blue hover:underline">Wild Tangz Discord</a></span>
        </div>
      </div>
    </footer>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <UserProvider>
        <body className={inter.className}>
          <Header />
          <main className="pb-4">
            <TermsAndConditionsModal id="btc-toolkit-info-firsttimer" header="Please Read Carefully" confirmation="I Understand" expiration={TWO_WEEKS_MS}>
              <span>The following interface attempts its best to render a preview of your recursive Ordinal.  Please, CAREFULLY inspect the code you enter below.  There are no refunds once orders are processed.</span>
            </TermsAndConditionsModal>
            {children}
            <Analytics />
          </main>
          <Footer />
        </body>
      </UserProvider>
    </html>
  )
}
