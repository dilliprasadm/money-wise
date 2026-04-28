import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { useRecurring } from "@/hooks/useRecurring"
import { usePeople } from "@/hooks/usePeople"
import { CATEGORIES } from "@/lib/categories"
import { CalendarClock, Plus, Trash2, CheckCircle2, AlertCircle, Search, Check, User, Pencil, FastForward } from "lucide-react"
import type { RecurringItem, RecurringType } from "@/types/recurring"

interface RecurringFinancesProps {
  onProcess: (item: any) => Promise<void>
}

export function RecurringFinances({ onProcess }: RecurringFinancesProps) {
  const { items, addRecurringItem, updateRecurringItem, deleteRecurringItem } = useRecurring()
  const { people } = usePeople()
  
  const [name, setName] = useState("")
  const [amount, setAmount] = useState("")
  const [dayOfMonth, setDayOfMonth] = useState("1")
  const [type, setType] = useState<RecurringType>("expense")
  const [category, setCategory] = useState("")
  const [selectedPerson, setSelectedPerson] = useState<string>("none")
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingItem, setEditingItem] = useState<RecurringItem | null>(null)

  // Searchable Category State
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)
  const [categorySearch, setCategorySearch] = useState("")
  const categoryRef = useRef<HTMLDivElement>(null)

  const now = new Date()
  const currentDay = now.getDate()
  const currentMonthYear = now.toISOString().slice(0, 7) // "YYYY-MM"
  const currentMonthName = now.toLocaleString('default', { month: 'long' })
  
  const pendingItems = items.filter(item => item.lastProcessedMonth !== currentMonthYear)

  useEffect(() => {
    if (editingItem) {
      setName(editingItem.name)
      setAmount(editingItem.amount.toString())
      setDayOfMonth(editingItem.dayOfMonth.toString())
      setType(editingItem.type)
      setCategory(editingItem.category)
      setCategorySearch(editingItem.category)
      setSelectedPerson(editingItem.person || "none")
      setShowAddForm(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [editingItem])

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
    setName("")
    setAmount("")
    setCategory("")
    setCategorySearch("")
    setDayOfMonth("1")
    setSelectedPerson("none")
    setEditingItem(null)
    setShowAddForm(false)
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !amount || !category) return

    const itemData = {
      name,
      amount: parseFloat(amount),
      dayOfMonth: parseInt(dayOfMonth),
      type,
      category,
      person: selectedPerson === "none" ? undefined : selectedPerson
    }

    if (editingItem?.id) {
      await updateRecurringItem(editingItem.id, itemData)
    } else {
      await addRecurringItem(itemData)
    }

    resetForm()
  }

  const handleSkip = async (item: RecurringItem) => {
    if (!item.id) return;
    await updateRecurringItem(item.id, { lastProcessedMonth: currentMonthYear });
  };

  const filteredCategories = CATEGORIES.filter(cat => 
    cat.name.toLowerCase().includes(categorySearch.toLowerCase())
  )

  const isCreditOrDebit = type === "credit" || type === "debit"

  return (
    <div className="space-y-6 pb-20 px-1 md:px-0">
      {/* Pending Items - Action Area */}
      {pendingItems.length > 0 && !editingItem && (
        <Card className="border-orange-200 bg-orange-50/30 shadow-sm animate-in fade-in zoom-in-95 duration-500 overflow-hidden">
          <CardHeader className="pb-3 px-4 pt-4 md:pt-6 md:px-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <CardTitle className="text-base md:text-lg flex items-center gap-2 text-orange-700 font-bold uppercase tracking-tight">
                <AlertCircle className="h-4 w-4 md:h-5 md:w-5" />
                Pending for {currentMonthName} ({pendingItems.length})
              </CardTitle>
              <div className="text-[10px] md:text-xs font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
                Today is {currentMonthName} {currentDay}
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-4 md:px-6 md:pb-6">
            <div className="grid gap-3">
              {pendingItems.map((item) => {
                const isOverdue = item.dayOfMonth < currentDay;
                return (
                  <div key={item.id} className={`flex flex-col md:flex-row md:items-center justify-between p-3 md:p-4 bg-white border rounded-xl shadow-sm transition-all hover:border-orange-300 ${isOverdue ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-blue-400'}`}>
                    <div className="mb-3 md:mb-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="font-bold text-slate-800 text-sm md:text-lg leading-none">{item.name}</div>
                        <span className={`text-[8px] md:text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter ${isOverdue ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                          {isOverdue ? 'Overdue' : 'Upcoming'}
                        </span>
                      </div>
                      <div className="text-[10px] md:text-xs text-muted-foreground flex items-center gap-1.5 mt-1 font-medium">
                        <CalendarClock className="h-3 w-3" />
                        Due {currentMonthName} {item.dayOfMonth}
                        {item.person && (
                          <>
                            <span className="text-slate-300">|</span>
                            <User className="h-3 w-3" />
                            {item.person}
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between md:justify-end gap-2 md:gap-4 border-t md:border-t-0 pt-2.5 md:pt-0">
                      <div className={`text-lg md:text-xl font-black ${
                        item.type === 'income' || item.type === 'credit' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {item.type === 'income' || item.type === 'credit' ? '+' : '-'}₹{item.amount.toLocaleString()}
                      </div>
                      <div className="flex gap-1.5 md:gap-2">
                        <Button 
                          variant="ghost"
                          size="sm" 
                          className="h-8 md:h-9 px-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 active:scale-95"
                          onClick={() => handleSkip(item)}
                          title="Skip"
                        >
                          <FastForward className="h-3.5 w-3.5 md:h-4 md:w-4" />
                          <span className="hidden sm:inline ml-1 text-[10px] font-bold">Skip</span>
                        </Button>
                        <Button 
                          size="sm" 
                          className={`h-8 md:h-9 px-2.5 md:px-4 text-[10px] md:text-xs font-black shadow-md active:scale-95 transition-all ${item.type === 'income' || item.type === 'credit' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                          onClick={() => onProcess(item)}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 md:h-4 md:w-4 md:mr-1.5" />
                          <span className="hidden sm:inline">{item.type === 'income' || item.type === 'credit' ? 'Mark as Received' : 'Mark as Paid'}</span>
                          <span className="sm:hidden">{item.type === 'income' || item.type === 'credit' ? 'RCVD' : 'PAID'}</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Management Area */}
      <Card className={`shadow-sm transition-all duration-300 ${editingItem ? 'ring-2 ring-primary border-primary' : 'border-slate-200'}`}>
        <CardHeader className="flex flex-row items-center justify-between border-b px-4 py-3 md:px-6 md:py-4">
          <CardTitle className="text-sm md:text-lg flex items-center gap-2 font-bold uppercase tracking-tight text-slate-700">
            <CalendarClock className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            {editingItem ? 'Edit Recurring' : 'Recurring Setup'}
          </CardTitle>
          <div className="flex gap-1.5 md:gap-2">
            {editingItem && (
              <Button variant="ghost" size="sm" className="h-8 text-[10px] font-bold px-2" onClick={resetForm}>
                CANCEL
              </Button>
            )}
            <Button variant={showAddForm && !editingItem ? "ghost" : "outline"} size="sm" className="h-8 md:h-9 text-[10px] md:text-xs font-black border-slate-200" onClick={() => editingItem ? resetForm() : setShowAddForm(!showAddForm)}>
              {showAddForm && !editingItem ? 'CANCEL' : (
                <>
                  <Plus className="h-3.5 w-3.5 md:mr-1.5" />
                  <span className="hidden sm:inline uppercase">Add Mandatory Item</span>
                  <span className="sm:hidden uppercase">ADD NEW</span>
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-4 md:pt-6 px-3 md:px-6">
          {showAddForm && (
            <form onSubmit={handleAdd} className="grid gap-4 md:gap-6 p-4 md:p-5 border rounded-xl mb-6 md:mb-8 bg-slate-50/50 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] md:text-xs font-black uppercase text-slate-500 ml-1">Label (e.g. Rent)</Label>
                  <Input value={name} onChange={e => setName(e.target.value)} placeholder="Rent" className="bg-white h-10 md:h-11 border-slate-200" required />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] md:text-xs font-black uppercase text-slate-500 ml-1">Amount</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                    <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="pl-7 bg-white h-10 md:h-11 border-slate-200" required />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] md:text-xs font-black uppercase text-slate-500 ml-1">Type</Label>
                  <Select value={type} onValueChange={(v: RecurringType) => setType(v)}>
                    <SelectTrigger className="bg-white h-10 md:h-11 border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                      <SelectItem value="credit">Credit (Borrowed)</SelectItem>
                      <SelectItem value="debit">Debit (Lent)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-1.5 relative" ref={categoryRef}>
                  <Label className="text-[10px] md:text-xs font-black uppercase text-slate-500 ml-1">Category</Label>
                  <div className="relative">
                    <Input
                      placeholder="Search..."
                      className="bg-white h-10 md:h-11 border-slate-200 pr-10 cursor-pointer"
                      value={categorySearch}
                      onFocus={() => setIsCategoryOpen(true)}
                      onChange={(e) => {
                        setCategorySearch(e.target.value)
                        setCategory(e.target.value)
                        setIsCategoryOpen(true)
                      }}
                      required
                    />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  </div>

                  {isCategoryOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 overflow-auto">
                      {filteredCategories.map((cat) => (
                        <div
                          key={cat.id}
                          className="flex items-center gap-3 px-3 py-3 hover:bg-slate-50 cursor-pointer transition-colors border-b last:border-0"
                          onClick={() => {
                            setCategory(cat.name)
                            setCategorySearch(cat.name)
                            setIsCategoryOpen(false)
                          }}
                        >
                          <cat.icon className={`h-4 w-4 ${cat.color}`} />
                          <span className="text-sm font-bold text-slate-700">{cat.name}</span>
                          {category === cat.name && <Check className="h-4 w-4 text-primary ml-auto" />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] md:text-xs font-black uppercase text-slate-500 ml-1">Due Day (1-31)</Label>
                  <Input type="number" min="1" max="31" value={dayOfMonth} onChange={e => setDayOfMonth(e.target.value)} className="bg-white h-10 md:h-11 border-slate-200" required />
                </div>
                
                {isCreditOrDebit && (
                  <div className="space-y-1.5 animate-in zoom-in-95">
                    <Label className="text-[10px] md:text-xs font-black uppercase text-slate-500 ml-1">Person</Label>
                    <Select value={selectedPerson} onValueChange={setSelectedPerson}>
                      <SelectTrigger className="bg-white h-10 md:h-11 border-blue-200">
                        <SelectValue placeholder="Select person" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No specific person</SelectItem>
                        {people.map((p) => (
                          <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <Button type="submit" className="w-full h-11 md:h-12 font-black shadow-lg rounded-xl active:scale-[0.98] transition-all">
                {editingItem ? 'UPDATE SETUP' : 'SAVE RECURRING ITEM'}
              </Button>
            </form>
          )}

          <div className="grid gap-2.5">
            {items.length === 0 ? (
              <div className="text-center py-10 md:py-16 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
                <CalendarClock className="h-8 w-8 md:h-12 md:w-12 text-slate-300 mx-auto mb-3 md:mb-4 opacity-50" />
                <p className="text-slate-500 text-xs md:text-sm font-bold uppercase tracking-wider">No mandatory items</p>
                <p className="text-[10px] md:text-xs text-slate-400 mt-1.5 px-6">Configure regular items like Rent or Salary here.</p>
              </div>
            ) : (
              items.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 md:p-4 border border-slate-100 rounded-xl hover:bg-slate-50/80 transition-all group active:bg-slate-100/50">
                  <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                    <div className={`p-2 md:p-2.5 rounded-xl shrink-0 ${
                      item.type === 'income' ? 'bg-green-50 text-green-600' : 
                      item.type === 'expense' ? 'bg-red-50 text-red-600' : 
                      item.type === 'credit' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'
                    }`}>
                      <CalendarClock className="h-4 w-4 md:h-5 md:w-5" />
                    </div>
                    <div className="overflow-hidden">
                      <div className="font-bold text-slate-700 text-sm md:text-base truncate">{item.name}</div>
                      <div className="text-[9px] md:text-[11px] text-muted-foreground flex items-center gap-1.5 font-bold uppercase tracking-tight truncate">
                        <span>Day {item.dayOfMonth}</span>
                        <span className="text-slate-200 font-normal">|</span>
                        <span className="truncate">{item.category}</span>
                        {item.person && (
                          <>
                            <span className="text-slate-200 font-normal">|</span>
                            <span className="text-blue-600 truncate flex items-center gap-0.5"><User className="h-2.5 w-2.5"/>{item.person}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 md:gap-3 shrink-0 ml-2">
                    <div className="font-black text-slate-800 text-xs md:text-sm whitespace-nowrap">₹{item.amount.toLocaleString()}</div>
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 md:h-8 md:w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50 sm:opacity-0 sm:group-hover:opacity-100 transition-all"
                        onClick={() => setEditingItem(item)}
                      >
                        <Pencil className="h-3.5 w-3.5 md:h-4 md:w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 md:h-8 md:w-8 text-red-400 hover:text-red-600 hover:bg-red-50 sm:opacity-0 sm:group-hover:opacity-100 transition-all"
                        onClick={() => item.id && deleteRecurringItem(item.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
