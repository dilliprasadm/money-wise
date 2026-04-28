import { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  query, 
  onSnapshot,
  deleteDoc,
  updateDoc,
  where,
  doc 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { RecurringItem } from '@/types/recurring';
import { useAuth } from './useAuth';

export function useRecurring() {
  const [items, setItems] = useState<RecurringItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "recurring_items"),
      where("userId", "==", user.uid)
    );
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const results: RecurringItem[] = [];
      querySnapshot.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() } as RecurringItem);
      });
      results.sort((a, b) => a.dayOfMonth - b.dayOfMonth);
      setItems(results);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching recurring items: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const addRecurringItem = async (item: Omit<RecurringItem, 'id' | 'createdAt'>) => {
    if (!user) return;
    try {
      const dataToSave = Object.fromEntries(
        Object.entries(item).filter(([_, v]) => v !== undefined)
      );

      await addDoc(collection(db, "recurring_items"), {
        ...dataToSave,
        userId: user.uid,
        createdAt: Date.now()
      });
    } catch (e) {
      console.error("Error adding recurring item: ", e);
    }
  };

  const updateRecurringItem = async (id: string, item: Partial<RecurringItem>) => {
    try {
      const dataToSave = Object.fromEntries(
        Object.entries(item).filter(([k, v]) => v !== undefined && k !== 'id')
      );
      
      await updateDoc(doc(db, "recurring_items", id), dataToSave);
    } catch (e) {
      console.error("Error updating recurring item: ", e);
    }
  };

  const deleteRecurringItem = async (id: string) => {
    try {
      await deleteDoc(doc(db, "recurring_items", id));
    } catch (e) {
      console.error("Error deleting recurring item: ", e);
    }
  };

  const processRecurringItem = async (item: RecurringItem, addTransaction: (tx: any) => Promise<void>) => {
    const currentMonth = new Date().toISOString().slice(0, 7); 
    
    if (item.lastProcessedMonth === currentMonth) {
      return;
    }

    try {
      const now = new Date();
      await addTransaction({
        amount: item.amount,
        date: now.toISOString().split('T')[0],
        time: now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
        category: item.category,
        description: `Recurring: ${item.name}`,
        type: item.type,
        person: item.person,
      });

      if (item.id) {
        await updateDoc(doc(db, "recurring_items", item.id), {
          lastProcessedMonth: currentMonth
        });
      }
    } catch (e) {
      console.error("Error processing recurring item: ", e);
    }
  };

  return { items, loading, addRecurringItem, updateRecurringItem, deleteRecurringItem, processRecurringItem };
}
