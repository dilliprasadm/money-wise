import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Transaction, TransactionType } from "@/types/transaction"
import { usePeople } from "@/hooks/usePeople"
import { CATEGORIES } from "@/lib/categories"
import { 
  X, 
  Search,
  Check
} from "lucide-react"

interface AddTransactionProps {
  onAdd: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void
  onUpdate: (id: string, transaction: Partial<Transaction>) => void
  editingTransaction?: Transaction | null
  onCancelEdit?: () => void
}

export function AddTransaction({ onAdd, onUpdate, editingTransaction, onCancelEdit }: AddTransactionProps) {
  const [amount, setAmount] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [time, setTime] = useState(new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }))
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState<TransactionType>("expense")
  const [selectedPerson, setSelectedPerson] = useState<string>("none")
  const [newPersonName, setNewPersonName] = useState("")
  const [showNewPersonInput, setShowNewPersonInput] = useState(false)
  
  // Searchable Category State
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)
  const [categorySearch, setCategorySearch] = useState("")
  const categoryRef = useRef<HTMLDivElement>(null)

  const { people, addPerson } = usePeople()

  useEffect(() => {
    if (editingTransaction) {
      setAmount(editingTransaction.amount.toString())
      setDate(editingTransaction.date)
      setTime(editingTransaction.time || new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }))
      setCategory(editingTransaction.category)
      setCategorySearch(editingTransaction.category)
      setDescription(editingTransaction.description || "")
      setType(editingTransaction.type)
      setSelectedPerson(editingTransaction.person || "none")
      setShowNewPersonInput(false)
      setNewPersonName("")
    } else {
      resetForm()
    }
  }, [editingTransaction])

  // Close category dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const resetForm = () => {
    setAmount("")
    setDate(new Date().toISOString().split('T')[0])
    setTime(new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }))
    setCategory("")
    setCategorySearch("")
    setDescription("")
    setType("expense")
    setSelectedPerson("none")
    setNewPersonName("")
    setShowNewPersonInput(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || !date || !category) return

    let person = selectedPerson === "none" ? undefined : selectedPerson
    
    // IF USER ENTERED A NEW NAME
    if (showNewPersonInput && newPersonName.trim()) {
      const trimmedName = newPersonName.trim()
      await addPerson(trimmedName)
      person = trimmedName
    }

    const transactionData = {
      amount: parseFloat(amount),
      date,
      time,
      category,
      description,
      type,
      person
    }

    if (editingTransaction?.id) {
      onUpdate(editingTransaction.id, transactionData)
      if (onCancelEdit) onCancelEdit()
    } else {
      onAdd(transactionData)
    }

    resetForm()
  }

  const filteredCategories = CATEGORIES.filter(cat => 
    cat.name.toLowerCase().includes(categorySearch.toLowerCase())
  )

  const isCreditOrDebit = type === "credit" || type === "debit"

  return (
    <Card className={editingTransaction ? "border-primary ring-1 ring-primary shadow-lg" : "shadow-md"}>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-xl font-bold">
          {editingTransaction ? "Edit Transaction" : "Add Transaction"}
        </CardTitle>
        {editingTransaction && (
          <Button variant="ghost" size="icon" onClick={onCancelEdit} className="rounded-full">
            <X className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type" className="text-sm font-semibold">Type</Label>
              <Select value={type} onValueChange={(v) => {
                const newType = v as TransactionType
                setType(newType)
                if (newType !== "credit" && newType !== "debit") {
                  setSelectedPerson("none")
                  setShowNewPersonInput(false)
                }
              }}>
                <SelectTrigger id="type" className="bg-slate-50 border-slate-200">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="credit">Credit (Borrowed)</SelectItem>
                  <SelectItem value="debit">Debit (Lent)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm font-semibold">Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">₹</span>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  className="pl-7 bg-slate-50 border-slate-200"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {isCreditOrDebit && (
            <div className="space-y-4 border-l-4 border-blue-400 pl-4 py-2 bg-blue-50/30 rounded-r-lg animate-in fade-in slide-in-from-left-2">
              <div className="space-y-2">
                <Label htmlFor="person" className="text-sm font-semibold">Person</Label>
                <Select 
                  value={showNewPersonInput ? "new" : selectedPerson} 
                  onValueChange={(v) => {
                    if (v === "new") {
                      setShowNewPersonInput(true)
                      setSelectedPerson("none")
                    } else {
                      setShowNewPersonInput(false)
                      setSelectedPerson(v)
                    }
                  }}
                >
                  <SelectTrigger id="person" className="bg-white border-blue-200">
                    <SelectValue placeholder="Who are you dealing with?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">General / No Name</SelectItem>
                    {/* Filter to show only unique names from the people list */}
                    {Array.from(new Set(people.map(p => p.name)))
                      .sort((a, b) => a.localeCompare(b))
                      .map((name) => (
                        <SelectItem key={name} value={name}>{name}</SelectItem>
                      ))
                    }
                    <SelectItem value="new" className="text-blue-600 font-bold border-t mt-1">
                      + Add New Person
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {showNewPersonInput && (
                <div className="space-y-2 animate-in zoom-in-95 duration-200">
                  <Label htmlFor="newName" className="text-xs font-bold text-blue-600 uppercase">New Person Name</Label>
                  <Input
                    id="newName"
                    placeholder="Enter full name"
                    className="border-blue-300 focus:ring-blue-500"
                    value={newPersonName}
                    onChange={(e) => setNewPersonName(e.target.value)}
                    autoFocus
                  />
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="text-sm font-semibold text-slate-600 flex items-center gap-1">
                Date
              </Label>
              <Input
                id="date"
                type="date"
                className="bg-slate-50 border-slate-200"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time" className="text-sm font-semibold text-slate-600 flex items-center gap-1">
                Time
              </Label>
              <Input
                id="time"
                type="time"
                className="bg-slate-50 border-slate-200"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2 relative" ref={categoryRef}>
              <Label htmlFor="category" className="text-sm font-semibold text-slate-600">Category</Label>
              <div className="relative">
                <Input
                  id="category"
                  placeholder="Search or type..."
                  className="bg-slate-50 border-slate-200 pr-10 cursor-pointer"
                  value={categorySearch}
                  onFocus={() => setIsCategoryOpen(true)}
                  onChange={(e) => {
                    setCategorySearch(e.target.value)
                    setCategory(e.target.value)
                    setIsCategoryOpen(true)
                  }}
                  required
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>

              {isCategoryOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-xl max-h-60 overflow-auto animate-in fade-in slide-in-from-top-2">
                  {filteredCategories.length > 0 ? (
                    filteredCategories.map((cat) => (
                      <div
                        key={cat.id}
                        className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-100 cursor-pointer transition-colors"
                        onClick={() => {
                          setCategory(cat.name)
                          setCategorySearch(cat.name)
                          setIsCategoryOpen(false)
                        }}
                      >
                        <cat.icon className={`h-4 w-4 ${cat.color}`} />
                        <span className="flex-1 text-sm font-medium">{cat.name}</span>
                        {category === cat.name && <Check className="h-4 w-4 text-primary" />}
                      </div>
                    ))
                  ) : (
                    <div 
                      className="px-3 py-3 text-sm italic text-slate-500 hover:bg-slate-100 cursor-pointer"
                      onClick={() => setIsCategoryOpen(false)}
                    >
                      Use custom: "{categorySearch}"
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold text-slate-600">Description (Optional)</Label>
            <Input
              id="description"
              placeholder="Notes, receipt info, etc."
              className="bg-slate-50 border-slate-200"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          
          <Button type="submit" className="w-full h-11 text-lg font-semibold shadow-sm transition-all hover:shadow-md">
            {editingTransaction ? "Update Transaction" : "Save Transaction"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
