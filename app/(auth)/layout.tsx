import { Scissors } from 'lucide-react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-600">
            <Scissors className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="block text-white font-bold text-xl leading-tight">
              BarberControl
            </span>
            <span className="block text-zinc-500 text-xs">Gestão Financeira</span>
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}
