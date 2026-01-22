import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  DocumentData,
  QueryConstraint,
  serverTimestamp,
  collectionData,
  docData,
  Timestamp,
} from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';

/**
 * Generic Firestore service for CRUD operations
 * Provides type-safe database operations with best practices
 */
@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  private readonly firestore = inject(Firestore);

  /**
   * Get a document by ID
   */
  getDocument<T>(collectionName: string, documentId: string): Observable<T | null> {
    const docRef = doc(this.firestore, collectionName, documentId);
    return from(getDoc(docRef)).pipe(
      map((snapshot) => {
        if (snapshot.exists()) {
          return { id: snapshot.id, ...snapshot.data() } as T;
        }
        return null;
      })
    );
  }

  /**
   * Get a document with real-time updates
   */
  getDocumentRealtime<T>(collectionName: string, documentId: string): Observable<T | null> {
    const docRef = doc(this.firestore, collectionName, documentId);
    return docData(docRef, { idField: 'id' }) as Observable<T | null>;
  }

  /**
   * Get all documents in a collection
   */
  getCollection<T>(collectionName: string, ...queryConstraints: QueryConstraint[]): Observable<T[]> {
    const collectionRef = collection(this.firestore, collectionName);
    const q = query(collectionRef, ...queryConstraints);
    return from(getDocs(q)).pipe(
      map((snapshot) =>
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as T)
      )
    );
  }

  /**
   * Get collection with real-time updates
   */
  getCollectionRealtime<T>(
    collectionName: string,
    ...queryConstraints: QueryConstraint[]
  ): Observable<T[]> {
    const collectionRef = collection(this.firestore, collectionName);
    const q = query(collectionRef, ...queryConstraints);
    return collectionData(q, { idField: 'id' }) as Observable<T[]>;
  }

  /**
   * Add a new document with auto-generated ID
   */
  addDocument<T extends DocumentData>(
    collectionName: string,
    data: T
  ): Observable<string> {
    const collectionRef = collection(this.firestore, collectionName);
    const docRef = doc(collectionRef);

    const dataWithTimestamp = {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    return from(setDoc(docRef, dataWithTimestamp)).pipe(map(() => docRef.id));
  }

  /**
   * Set a document with a specific ID
   */
  setDocument<T extends DocumentData>(
    collectionName: string,
    documentId: string,
    data: T,
    merge = false
  ): Observable<void> {
    const docRef = doc(this.firestore, collectionName, documentId);

    const dataWithTimestamp = {
      ...data,
      updatedAt: serverTimestamp(),
      ...(merge ? {} : { createdAt: serverTimestamp() }),
    };

    return from(setDoc(docRef, dataWithTimestamp, { merge }));
  }

  /**
   * Update specific fields in a document
   */
  updateDocument(
    collectionName: string,
    documentId: string,
    data: Partial<DocumentData>
  ): Observable<void> {
    const docRef = doc(this.firestore, collectionName, documentId);

    const dataWithTimestamp = {
      ...data,
      updatedAt: serverTimestamp(),
    };

    return from(updateDoc(docRef, dataWithTimestamp));
  }

  /**
   * Delete a document
   */
  deleteDocument(collectionName: string, documentId: string): Observable<void> {
    const docRef = doc(this.firestore, collectionName, documentId);
    return from(deleteDoc(docRef));
  }

  /**
   * Check if a document exists
   */
  documentExists(collectionName: string, documentId: string): Observable<boolean> {
    const docRef = doc(this.firestore, collectionName, documentId);
    return from(getDoc(docRef)).pipe(map((snapshot) => snapshot.exists()));
  }

  /**
   * Query helpers - export these for use in components
   */
  whereEqual(field: string, value: unknown) {
    return where(field, '==', value);
  }

  whereIn(field: string, values: unknown[]) {
    return where(field, 'in', values);
  }

  whereArrayContains(field: string, value: unknown) {
    return where(field, 'array-contains', value);
  }

  orderByField(field: string, direction: 'asc' | 'desc' = 'asc') {
    return orderBy(field, direction);
  }

  limitTo(count: number) {
    return limit(count);
  }

  startAfterDoc(document: DocumentData) {
    return startAfter(document);
  }
}
