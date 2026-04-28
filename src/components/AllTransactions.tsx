import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TransactionHistory } from "./TransactionHistory"
import { CATEGORIES } from "@/lib/categories"
import type { Transaction } from "@/types/transaction"
import { Search, FilterX, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AllTransactionsProps {
  transactions: Transaction[]
  onDelete: (id: string) => void
  onEdit: (transaction: Transaction) => void
  onBack: () => void
}

export function AllTransactions({ transactions, onDelete, onEdit, onBack }: AllTransactionsProps) {
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const matchesSearch = 
        tx.category.toLowerCase().includes(search.toLowerCase()) ||
        tx.description.toLowerCase().includes(search.toLowerCase()) ||
        (tx.person && tx.person.toLowerCase().includes(search.toLowerCase()));
      
      const matchesType = typeFilter === "all" || tx.type === typeFilter;
      const matchesCategory = categoryFilter === "all" || tx.category === categoryFilter;

      return matchesSearch && matchesType && matchesCategory;
    });
  }, [transactions, search, typeFilter, categoryFilter]);

  const resetFilters = () => {
    setSearch("");
    setTypeFilter("all");
    setCategoryFilter("all");
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-2xl font-bold text-slate-800">All Transactions</h2>
      </div>

      <Card className="shadow-sm border-slate-200">
        <CardHeader className="pb-4 border-b bg-slate-50/50">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search category, notes, or person..." 
                className="pl-9 bg-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
                <SelectItem value="credit">Credit</SelectItem>
                <SelectItem value="debit">Debit</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {(search || typeFilter !== "all" || categoryFilter !== "all") && (
            <div className="flex justify-end pt-2">
              <Button variant="ghost" size="sm" onClick={resetFilters} className="text-xs h-7 text-slate-500 hover:text-slate-800">
                <FilterX className="h-3 w-3 mr-1" />
                Clear Filters
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="p-0">
          <TransactionHistory 
            transactions={filteredTransactions} 
            onDelete={onDelete} 
            onEdit={onEdit} 
          />
        </CardContent>
      </Card>
      
      <div className="text-center text-xs text-muted-foreground">
        Showing {filteredTransactions.length} of {transactions.length} transactions
      </div>
    </div>
  )
}
