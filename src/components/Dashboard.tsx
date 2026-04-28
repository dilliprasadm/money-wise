import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Transaction } from "@/types/transaction"
import type { RecurringItem } from "@/types/recurring"
import { Wallet, Users, AlertCircle, TrendingUp, TrendingDown, Calendar } from "lucide-react"

interface DashboardProps {
  transactions: Transaction[]
  recurringItems?: RecurringItem[]
}

export function Dashboard({ transactions, recurringItems = [] }: DashboardProps) {
  const now = new Date();
  const currentMonthStr = now.toISOString().slice(0, 7); // "YYYY-MM"
  const currentMonthName = now.toLocaleString('default', { month: 'long' });

  // 1. LIFETIME STATS (for Total Balance)
  const lifetimeIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const lifetimeExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const lifetimeCredit = transactions
    .filter(t => t.type === 'credit')
    .reduce((acc, t) => acc + t.amount, 0);

  const lifetimeDebit = transactions
    .filter(t => t.type === 'debit')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalBalance = lifetimeIncome - lifetimeExpense + lifetimeCredit - lifetimeDebit;

  // 2. THIS MONTH'S STATS
  const monthTransactions = transactions.filter(t => t.date.startsWith(currentMonthStr));
  
  const monthIncome = monthTransactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const monthExpense = monthTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  // 3. PERSON-WISE BALANCES
  const personStats = transactions.reduce((acc, t) => {
    if (!t.person) return acc;
    if (!acc[t.person]) {
      acc[t.person] = { credit: 0, debit: 0 };
    }
    if (t.type === 'credit') acc[t.person].credit += t.amount;
    if (t.type === 'debit') acc[t.person].debit += t.amount;
    return acc;
  }, {} as Record<string, { credit: number; debit: number }>);

  // Mandatory Items Summary
  const pendingRecurring = recurringItems.filter(item => item.lastProcessedMonth !== currentMonthStr);
  const pendingToPayCount = pendingRecurring.filter(item => item.type === 'expense' || item.type === 'debit').length;
  const pendingToReceiveCount = pendingRecurring.filter(item => item.type === 'income' || item.type === 'credit').length;

  // Add pending recurring items with person names to the dashboard balances
  pendingRecurring.forEach(item => {
    if (item.person) {
      if (!personStats[item.person]) {
        personStats[item.person] = { credit: 0, debit: 0 };
      }
      if (item.type === 'credit') personStats[item.person].credit += item.amount;
      if (item.type === 'debit') personStats[item.person].debit += item.amount;
    }
  });

  const peopleWithBalances = Object.entries(personStats)
    .map(([name, stats]) => ({
      name,
      balance: stats.credit - stats.debit,
      ...stats
    }))
    .sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance));

  return (
    <div className="space-y-6">
      <div className="grid gap-3 grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Balance Card */}
        <Card className="col-span-2 md:col-span-1 border-l-4 border-l-primary shadow-sm bg-gradient-to-br from-white to-slate-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 md:pb-2">
            <CardTitle className="text-[10px] md:text-xs font-bold uppercase text-muted-foreground">Total Wallet</CardTitle>
            <Wallet className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className={`text-xl md:text-2xl font-black ${totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₹{totalBalance.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        {/* Combined Month Stats Card */}
        <Card className="col-span-2 md:col-span-1 border-l-4 border-l-blue-400 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 md:pb-2">
            <CardTitle className="text-[10px] md:text-xs font-bold uppercase text-muted-foreground">{currentMonthName} Summary</CardTitle>
            <Calendar className="h-3.5 w-3.5 md:h-4 md:w-4 text-blue-500" />
          </CardHeader>
          <CardContent className="space-y-1.5 md:space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5 text-xs md:text-sm text-green-600 font-bold">
                <TrendingUp className="h-3 w-3 md:h-3.5 md:w-3.5" />
                Income
              </div>
              <div className="font-bold text-sm md:text-base">₹{monthIncome.toLocaleString()}</div>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5 text-xs md:text-sm text-red-500 font-bold">
                <TrendingDown className="h-3 w-3 md:h-3.5 md:w-3.5" />
                Expense
              </div>
              <div className="font-bold text-sm md:text-base">₹{monthExpense.toLocaleString()}</div>
            </div>
          </CardContent>
        </Card>

        {/* Dues Card */}
        <Card className="col-span-1 border-l-4 border-l-orange-400 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 md:pb-2">
            <CardTitle className="text-[10px] md:text-xs font-bold uppercase text-muted-foreground">Pending</CardTitle>
            <AlertCircle className="h-3.5 w-3.5 md:h-4 md:w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-black text-slate-700">
              {pendingRecurring.length}
            </div>
            <p className="text-[9px] md:text-[10px] text-muted-foreground font-medium leading-tight">
              {pendingToPayCount} Pay / {pendingToReceiveCount} Recv
            </p>
          </CardContent>
        </Card>

        {/* Net Debt/Credit Overview */}
        <Card className="col-span-1 border-l-4 border-l-slate-400 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 md:pb-2">
            <CardTitle className="text-[10px] md:text-xs font-bold uppercase text-muted-foreground">Net Position</CardTitle>
            <Users className="h-3.5 w-3.5 md:h-4 md:w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-black text-slate-700">
              ₹{(lifetimeCredit - lifetimeDebit).toLocaleString()}
            </div>
            <p className="text-[9px] md:text-[10px] text-muted-foreground font-medium">Lifetime net</p>
          </CardContent>
        </Card>
      </div>

      {peopleWithBalances.length > 0 && (
        <Card className="border-none shadow-sm bg-slate-50/50">
          <CardHeader className="pb-3 px-4">
            <CardTitle className="text-xs md:text-sm font-bold flex items-center gap-2 text-slate-600 uppercase tracking-wider">
              <Users className="h-3.5 w-3.5 md:h-4 md:w-4" />
              Person-wise Debt/Credit (Live)
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 md:px-6">
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {peopleWithBalances.map((person) => (
                <div key={person.name} className="flex flex-col p-3 md:p-4 rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all active:scale-[0.98]">
                  <div className="flex justify-between items-start mb-2 md:mb-3">
                    <span className="font-bold text-slate-700 md:text-lg truncate max-w-[120px]">{person.name}</span>
                    <span className={`text-[8px] md:text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter md:tracking-normal ${
                      person.balance > 0 ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {person.balance > 0 ? 'You Owe' : 'Owes You'}
                    </span>
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="text-[9px] md:text-[10px] text-muted-foreground space-y-0.5 font-medium">
                      <div className="flex justify-between gap-3">
                        <span>Borrowed:</span>
                        <span className="text-slate-600 font-bold">₹{person.credit.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span>Lent:</span>
                        <span className="text-slate-600 font-bold">₹{person.debit.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="text-lg md:text-xl font-black text-slate-900">
                      ₹{Math.abs(person.balance).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
