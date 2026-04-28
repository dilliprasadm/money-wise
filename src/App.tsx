import { useState } from "react"
import { useTransactions } from "./hooks/useTransactions"
import { useRecurring } from "./hooks/useRecurring"
import { useAuth } from "./hooks/useAuth"
import { Dashboard } from "./components/Dashboard"
import { AddTransaction } from "./components/AddTransaction"
import { TransactionHistory } from "./components/TransactionHistory"
import { RecurringFinances } from "./components/RecurringFinances"
import { AllTransactions } from "./components/AllTransactions"
import { Auth } from "./components/Auth"
import { Wallet, CalendarClock, LayoutDashboard, Plus, ChevronRight, LogOut, User as UserIcon } from "lucide-react"
import type { Transaction } from "./types/transaction"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"

function App() {
  const { user, loading: authLoading, logout } = useAuth()
  const { transactions, loading: txLoading, addTransaction, deleteTransaction, updateTransaction } = useTransactions()
  const { items, processRecurringItem, loading: recLoading } = useRecurring()
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [view, setView] = useState<"dashboard" | "all-transactions">("dashboard")

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setView("dashboard")
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancelEdit = () => {
    setEditingTransaction(null)
  }

  const handleProcessRecurring = async (item: any) => {
    await processRecurringItem(item, addTransaction)
  }

  const isLoading = authLoading || txLoading || recLoading

  // Dashboard logic
  const recentTransactions = transactions.slice(0, 10);

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-muted-foreground font-medium animate-pulse">Authenticating...</p>
      </div>
    )
  }

  if (!user) {
    return <Auth />
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView("dashboard")}>
            <div className="bg-primary p-1.5 rounded-lg">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
              MoneyWise
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full border border-slate-200">
              <UserIcon className="h-3.5 w-3.5 text-slate-500" />
              <span className="text-xs font-medium text-slate-700 truncate max-w-[150px]">
                {user.email}
              </span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={logout}
              className="text-slate-500 hover:text-red-600 hover:bg-red-50 gap-1.5"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-xs font-bold">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-muted-foreground animate-pulse font-medium">Loading your finances...</p>
          </div>
        ) : (
          <Tabs defaultValue="dashboard" className="space-y-8" onValueChange={() => setView("dashboard")}>
            <div className="flex justify-center">
              <TabsList className="bg-white border shadow-sm p-1 h-12">
                <TabsTrigger value="dashboard" className="px-6 h-10 data-[state=active]:bg-primary data-[state=active]:text-white">
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Dashboard
                </TabsTrigger>
                <TabsTrigger value="recurring" className="px-6 h-10 data-[state=active]:bg-primary data-[state=active]:text-white">
                  <CalendarClock className="h-4 w-4 mr-2" />
                  Mandatory Payments
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="dashboard" className="space-y-8 animate-in fade-in duration-500">
              {view === "dashboard" ? (
                <>
                  <section>
                    <Dashboard transactions={transactions} recurringItems={items} />
                  </section>

                  <div className="grid gap-8 lg:grid-cols-12">
                    <div className="lg:col-span-5 space-y-8">
                      <section className="space-y-4">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                          <Plus className="h-5 w-5 text-primary" />
                          {editingTransaction ? "Edit Transaction" : "New Entry"}
                        </h2>
                        <AddTransaction 
                          onAdd={addTransaction} 
                          onUpdate={updateTransaction}
                          editingTransaction={editingTransaction}
                          onCancelEdit={handleCancelEdit}
                        />
                      </section>
                    </div>

                    <div className="lg:col-span-7 space-y-4">
                      <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-slate-800">Recent History</h2>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 text-xs font-bold text-primary border-primary/20 hover:bg-primary/5 rounded-full px-4"
                          onClick={() => setView("all-transactions")}
                        >
                          View All History
                          <ChevronRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                      <TransactionHistory 
                        transactions={recentTransactions} 
                        onDelete={deleteTransaction} 
                        onEdit={handleEdit}
                      />
                      {transactions.length > 10 && (
                        <p className="text-center text-[10px] text-muted-foreground mt-4 italic font-medium">
                          Only showing latest 10 transactions. Use "View All" to see your full history.
                        </p>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <AllTransactions 
                  transactions={transactions} 
                  onDelete={deleteTransaction} 
                  onEdit={handleEdit}
                  onBack={() => setView("dashboard")}
                />
              )}
            </TabsContent>

            <TabsContent value="recurring" className="animate-in fade-in duration-500 max-w-3xl mx-auto">
              <RecurringFinances onProcess={handleProcessRecurring} />
            </TabsContent>
          </Tabs>
        )}
      </main>

      <footer className="py-8 text-center text-muted-foreground text-xs border-t bg-white mt-20 font-medium">
        <p>© 2026 MoneyWise • Powered by Firebase Authentication</p>
      </footer>
    </div>
  )
}

export default App
