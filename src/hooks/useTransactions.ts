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
import type { Transaction } from '@/types/transaction';
import { useAuth } from './useAuth';

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      console.log("No user found in useTransactions, skipping fetch");
      setTransactions([]);
      setLoading(false);
      return;
    }

    console.log("Fetching transactions for user:", user.uid);
    
    // We start with a simple query first to avoid index issues during debugging
    const q = query(
      collection(db, "transactions"), 
      where("userId", "==", user.uid)
    );
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      console.log("Transactions snapshot received, count:", querySnapshot.size);
      const txs: Transaction[] = [];
      querySnapshot.forEach((doc) => {
        txs.push({ id: doc.id, ...doc.data() } as Transaction);
      });
      
      // Manual sort by date since we removed orderBy from query
      txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setTransactions(txs);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching transactions: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
    if (!user) {
      console.error("Cannot add transaction: No user logged in");
      return;
    }
    
    console.log("Attempting to add transaction for user:", user.uid, transaction);
    
    try {
      const dataToSave = Object.fromEntries(
        Object.entries(transaction).filter(([_, v]) => v !== undefined)
      );

      const docRef = await addDoc(collection(db, "transactions"), {
        ...dataToSave,
        userId: user.uid,
        createdAt: Date.now()
      });
      console.log("Successfully added transaction with ID:", docRef.id);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      await deleteDoc(doc(db, "transactions", id));
    } catch (e) {
      console.error("Error deleting document: ", e);
    }
  };

  const updateTransaction = async (id: string, transaction: Partial<Transaction>) => {
    try {
      const { id: _, ...data } = transaction;
      const dataToUpdate = Object.fromEntries(
        Object.entries(data).filter(([_, v]) => v !== undefined)
      );

      await updateDoc(doc(db, "transactions", id), dataToUpdate);
    } catch (e) {
      console.error("Error updating document: ", e);
    }
  };

  return { transactions, loading, addTransaction, deleteTransaction, updateTransaction };
}
