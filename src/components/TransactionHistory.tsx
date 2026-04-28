import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Transaction } from "@/types/transaction"
import { Button } from "@/components/ui/button"
import { Trash2, User, Pencil, Clock } from "lucide-react"

interface TransactionHistoryProps {
  transactions: Transaction[]
  onDelete: (id: string) => void
  onEdit: (transaction: Transaction) => void
}

export function TransactionHistory({ transactions, onDelete, onEdit }: TransactionHistoryProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'income': return 'text-green-600 font-semibold'
      case 'expense': return 'text-red-600 font-semibold'
      case 'credit': return 'text-blue-600 font-semibold'
      case 'debit': return 'text-orange-600 font-semibold'
      default: return ''
    }
  }

  if (transactions.length === 0) {
    return (
      <div className="rounded-md border bg-white p-8 text-center text-muted-foreground italic">
        No transactions found.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Mobile View - Cards */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {transactions.map((tx) => (
          <div key={tx.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm active:bg-slate-50 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <div className="flex flex-col">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${getTypeColor(tx.type)}`}>
                  {tx.type}
                </span>
                <span className="font-bold text-slate-800">{tx.category}</span>
              </div>
              <div className="text-lg font-black text-slate-900">
                ₹{tx.amount.toLocaleString()}
              </div>
            </div>
            
            <div className="flex flex-col gap-1.5 mb-3">
              {tx.person && (
                <div className="flex items-center gap-1.5 text-xs text-blue-600 font-medium bg-blue-50 w-fit px-2 py-0.5 rounded">
                  <User className="h-3 w-3" />
                  {tx.person}
                </div>
              )}
              {tx.description && (
                <p className="text-xs text-slate-500 italic line-clamp-1">{tx.description}</p>
              )}
              <div className="flex items-center gap-3 text-[10px] text-slate-400 font-medium">
                <span className="flex items-center gap-1"><CalendarIcon className="h-3 w-3" />{tx.date}</span>
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{tx.time || "--:--"}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 text-xs gap-1.5 border-slate-200 text-slate-600"
                onClick={() => onEdit(tx)}
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 text-xs gap-1.5 border-red-100 text-red-500 hover:bg-red-50 hover:text-red-600"
                onClick={() => tx.id && onDelete(tx.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop View - Table */}
      <div className="hidden md:block rounded-md border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[150px]">Date & Time</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx) => (
              <TableRow key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                <TableCell className="whitespace-nowrap">
                  <div className="text-sm font-medium">{tx.date}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {tx.time || "--:--"}
                  </div>
                </TableCell>
                <TableCell className={getTypeColor(tx.type)}>
                  {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                </TableCell>
                <TableCell>
                  <div className="font-semibold text-slate-700">{tx.category}</div>
                  <div className="space-y-0.5">
                    {tx.person && (
                      <div className="flex items-center gap-1 text-xs text-blue-600 font-medium">
                        <User className="h-3 w-3" />
                        {tx.person}
                      </div>
                    )}
                    {tx.description && (
                      <div className="text-xs text-muted-foreground italic truncate max-w-[200px]" title={tx.description}>
                        {tx.description}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-bold text-slate-900">₹{tx.amount.toLocaleString()}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                      onClick={() => onEdit(tx)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50"
                      onClick={() => tx.id && onDelete(tx.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>
    </svg>
  )
}
