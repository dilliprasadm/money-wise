import { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  onSnapshot,
  query,
  where
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './useAuth';

export interface Person {
  id: string;
  name: string;
}

export function usePeople() {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setPeople([]);
      setLoading(false);
      return;
    }

    // Simplified query to avoid index issues
    const q = query(
      collection(db, "people"), 
      where("userId", "==", user.uid)
    );
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const p: Person[] = [];
      querySnapshot.forEach((doc) => {
        p.push({ id: doc.id, name: doc.data().name } as Person);
      });
      
      // Sort in memory to avoid needing a Firestore composite index
      p.sort((a, b) => a.name.localeCompare(b.name));
      
      setPeople(p);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching people: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const addPerson = async (name: string) => {
    if (!user) return;
    const trimmedName = name.trim();
    if (!trimmedName) return;
    
    if (people.some(p => p.name.toLowerCase() === trimmedName.toLowerCase())) {
      return;
    }

    try {
      await addDoc(collection(db, "people"), {
        name: trimmedName,
        userId: user.uid,
        createdAt: Date.now()
      });
    } catch (e) {
      console.error("Error adding person: ", e);
    }
  };

  return { people, loading, addPerson };
}
