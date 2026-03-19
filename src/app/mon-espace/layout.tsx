import type { Metadata } from 'next'
import { Sidebar } from '@/components/mon-espace/Sidebar'

export const metadata: Metadata = {
  title: 'Mon espace — RÉCUPÉO',
  description: 'Retrouvez vos diagnostics, suivez vos démarches et récupérez votre argent.',
  robots: { index: false, follow: false },
}

export default function MonEspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-bg pt-16">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 lg:p-10 max-w-[1000px]">
          {children}
        </main>
      </div>
    </div>
  )
}
