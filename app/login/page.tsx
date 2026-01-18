'use client'

import { createClient } from '@/utils/supabase/client'

export default function LoginPage() {
  const handleLogin = async () => {
    const supabase = createClient()
    const origin = window.location.origin
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-void-black p-4">
      <div 
        className="w-full max-w-md border border-neon-cyan bg-gunmetal-grey p-8 shadow-[0_0_15px_rgba(8,217,214,0.3)] relative" 
        style={{ clipPath: 'polygon(0 0, 100% 0, 100% 90%, 95% 100%, 0 100%)' }}
      >
        <div className="absolute top-0 right-0 p-2 text-xs font-mono text-neon-cyan/50">SYS.AUTH.V1</div>
        <h1 className="mb-2 text-center text-4xl font-heading font-bold text-white tracking-wider">
          DECK DOJO
        </h1>
        <p className="mb-8 text-center text-sm font-mono text-neon-cyan opacity-80">
          ENTER THE SYSTEM
        </p>

        <button
          onClick={handleLogin}
          className="group relative flex w-full items-center justify-center bg-transparent px-6 py-4 text-white transition-all hover:bg-neon-cyan/10 border border-neon-cyan"
          style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}
        >
          <span className="font-mono text-lg tracking-widest group-hover:text-neon-cyan">
            SIGN IN WITH GOOGLE
          </span>
        </button>
      </div>
    </div>
  )
}
