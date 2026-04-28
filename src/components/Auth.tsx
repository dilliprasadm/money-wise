import { useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Wallet, AlertCircle, Loader2 } from "lucide-react"

export function Auth() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  
  const { login, signup, loginWithGoogle } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    
    try {
      if (isLogin) {
        await login(email, password)
      } else {
        await signup(email, password)
      }
    } catch (err: any) {
      console.error(err)
      setError(err.message || "An error occurred during authentication")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError("")
    setGoogleLoading(true)
    try {
      await loginWithGoogle()
    } catch (err: any) {
      console.error(err)
      setError(err.message || "An error occurred during Google sign in")
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-slate-50 px-4 py-8">
      <div className="flex items-center gap-2 mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="bg-primary p-2 rounded-xl">
          <Wallet className="h-6 w-6 md:h-8 md:w-8 text-white" />
        </div>
        <h1 className="text-2xl md:text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600 tracking-tight">
          MoneyWise
        </h1>
      </div>

      <Card className="w-full max-w-sm md:max-w-md shadow-xl border-slate-200 animate-in fade-in zoom-in-95 duration-500 overflow-hidden">
        <CardHeader className="space-y-1.5 text-center bg-white border-b pb-6 pt-8">
          <CardTitle className="text-xl md:text-2xl font-black text-slate-800">
            {isLogin ? "Welcome Back" : "Create Account"}
          </CardTitle>
          <CardDescription className="text-xs md:text-sm font-medium px-4">
            {isLogin 
              ? "Access your dashboard to manage your finances" 
              : "Join and start tracking your personal expenses"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <Button 
            variant="outline" 
            className="w-full h-11 font-bold flex items-center justify-center gap-3 bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-sm"
            onClick={handleGoogleLogin}
            disabled={googleLoading || loading}
          >
            {googleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            ) : (
              <svg className="h-4 w-4 md:h-5 md:w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1.01.67-2.3 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.67-.35-1.39-.35-2.09s.13-1.42.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            <span className="text-xs md:text-sm">Continue with Google</span>
          </Button>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-100" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-black">
              <span className="bg-white px-3 text-slate-400">OR</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded flex items-start gap-3 animate-in shake-in-1 duration-300">
                <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-red-700 font-bold leading-relaxed">{error}</p>
              </div>
            )}
            
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-bold text-slate-600 ml-1 uppercase">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="name@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-slate-50/50 border-slate-200 focus:ring-primary h-11 rounded-lg"
              />
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="password" title="At least 6 characters" className="text-xs font-bold text-slate-600 ml-1 uppercase">Password</Label>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-slate-50/50 border-slate-200 focus:ring-primary h-11 rounded-lg"
              />
            </div>
            
            <Button type="submit" className="w-full h-11 font-black shadow-lg rounded-lg transition-all active:scale-[0.98]" disabled={loading || googleLoading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                isLogin ? "SIGN IN" : "CREATE ACCOUNT"
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <button 
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-xs md:text-sm font-bold text-primary hover:text-blue-700 transition-all underline underline-offset-4"
            >
              {isLogin 
                ? "Don't have an account? Sign Up" 
                : "Already have an account? Sign In"}
            </button>
          </div>
        </CardContent>
      </Card>
      
      <p className="mt-8 text-slate-400 text-[10px] font-black uppercase tracking-widest">
        100% Secure & Private
      </p>
    </div>
  )
}
