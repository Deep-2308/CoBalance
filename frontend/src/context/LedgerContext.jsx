import { createContext, useContext, useState, useCallback, useRef } from 'react';
import api from '../services/api';

/**
 * LedgerContext - Centralized state management for transactions with optimistic updates
 * 
 * Implements the Optimistic UI pattern:
 * 1. SNAPSHOT - Clone current state before changes
 * 2. PREDICT - Create temporary transaction with temp ID
 * 3. UPDATE - Immediately update React state
 * 4. REQUEST - Fire API call in background
 * 5. RECONCILE - Replace temp with real data, or rollback on error
 */

const LedgerContext = createContext(null);

export const useLedger = () => {
  const context = useContext(LedgerContext);
  if (!context) {
    throw new Error('useLedger must be used within LedgerProvider');
  }
  return context;
};

export const LedgerProvider = ({ children }) => {
  // State for current contact's transactions and balance
  const [transactions, setTransactions] = useState([]);
  const [currentBalance, setCurrentBalance] = useState('0.00');
  const [currentContactId, setCurrentContactId] = useState(null);
  
  // Track pending operations for UI indicators
  const [pendingIds, setPendingIds] = useState(new Set());
  
  // Ref for snapshot storage (avoids stale closure issues)
  const snapshotRef = useRef(null);

  /**
   * Initialize context with contact data (called by ContactDetailPage)
   */
  const initializeForContact = useCallback((contactId, txns, balance) => {
    setCurrentContactId(contactId);
    setTransactions(txns || []);
    setCurrentBalance(balance || '0.00');
    setPendingIds(new Set());
  }, []);

  /**
   * Calculate new balance after adding a transaction
   */
  const calculateNewBalance = useCallback((currentBal, amount, txType) => {
    const bal = parseFloat(currentBal);
    const amt = parseFloat(amount);
    // credit = money owed TO user (increases balance)
    // debit = money owed BY user (decreases balance)
    const newBal = txType === 'credit' ? bal + amt : bal - amt;
    return newBal.toFixed(2);
  }, []);

  /**
   * Add transaction with optimistic update
   * Returns immediately after updating UI, API runs in background
   */
  const addTransactionOptimistic = useCallback(async (payload, onSuccess, onError) => {
    // 1. SNAPSHOT
    const prevTransactions = [...transactions];
    const prevBalance = currentBalance;
    snapshotRef.current = { transactions: prevTransactions, balance: prevBalance };

    // 2. PREDICT - Create optimistic transaction
    const tempId = `temp-${Date.now()}`;
    const optimisticTx = {
      id: tempId,
      contact_id: payload.contact_id,
      amount: payload.amount.toString(),
      transaction_type: payload.transaction_type,
      note: payload.note || '',
      date: payload.date,
      category: payload.category || 'other',
      created_at: new Date().toISOString(),
      isPending: true,
      running_balance: calculateNewBalance(currentBalance, payload.amount, payload.transaction_type)
    };

    // 3. UPDATE - Immediately update state
    const newBalance = calculateNewBalance(currentBalance, payload.amount, payload.transaction_type);
    setTransactions(prev => [optimisticTx, ...prev]);
    setCurrentBalance(newBalance);
    setPendingIds(prev => new Set([...prev, tempId]));

    // Call success callback immediately for navigation
    if (onSuccess) {
      onSuccess();
    }

    // 4. REQUEST - Fire API in background
    try {
      const response = await api.post('/ledger/transactions', {
        contact_id: payload.contact_id,
        amount: payload.amount,
        transaction_type: payload.transaction_type,
        note: payload.note,
        date: payload.date,
        category: payload.category
      });

      // 5. RECONCILE - Replace temp with real transaction
      const realTx = response.data.transaction;
      setTransactions(prev => 
        prev.map(tx => tx.id === tempId ? { ...realTx, isPending: false } : tx)
      );
      setPendingIds(prev => {
        const next = new Set(prev);
        next.delete(tempId);
        return next;
      });

    } catch (error) {
      console.error('Transaction failed, rolling back:', error);
      
      // ROLLBACK
      setTransactions(prevTransactions);
      setCurrentBalance(prevBalance);
      setPendingIds(prev => {
        const next = new Set(prev);
        next.delete(tempId);
        return next;
      });

      // Show error
      if (onError) {
        onError(error.response?.data?.error || 'Failed to add transaction');
      } else {
        alert('Failed to add transaction');
      }
    }
  }, [transactions, currentBalance, calculateNewBalance]);

  /**
   * Settle contact balance with optimistic update
   * Returns immediately after updating UI, API runs in background
   */
  const settleContactOptimistic = useCallback(async (contactId, balance, contactName, onSuccess, onError) => {
    // 1. SNAPSHOT
    const prevTransactions = [...transactions];
    const prevBalance = currentBalance;
    snapshotRef.current = { transactions: prevTransactions, balance: prevBalance };

    // Calculate settlement transaction type
    // Positive balance (they owe you) → Create "debit" tx (You Received money)
    // Negative balance (you owe them) → Create "credit" tx (You Paid money)
    const transactionType = balance > 0 ? 'debit' : 'credit';
    const absBalance = Math.abs(balance);

    // 2. PREDICT - Create optimistic settlement transaction
    const tempId = `temp-settle-${Date.now()}`;
    const optimisticTx = {
      id: tempId,
      contact_id: contactId,
      amount: absBalance.toString(),
      transaction_type: transactionType,
      note: 'Settlement via CoBalance',
      date: new Date().toISOString().split('T')[0],
      category: 'other',
      created_at: new Date().toISOString(),
      isPending: true,
      running_balance: '0.00'
    };

    // 3. UPDATE - Immediately update state
    setTransactions(prev => [optimisticTx, ...prev]);
    setCurrentBalance('0.00');
    setPendingIds(prev => new Set([...prev, tempId]));

    // Call success callback immediately for modal close
    if (onSuccess) {
      onSuccess();
    }

    // 4. REQUEST - Fire API in background
    try {
      const payload = {
        contact_id: contactId,
        amount: absBalance,
        transaction_type: transactionType,
        category: 'other',
        note: 'Settlement via CoBalance',
        date: new Date().toISOString().split('T')[0]
      };

      const response = await api.post('/ledger/transactions', payload);

      // 5. RECONCILE - Replace temp with real transaction
      const realTx = response.data.transaction;
      setTransactions(prev => 
        prev.map(tx => tx.id === tempId ? { ...realTx, isPending: false } : tx)
      );
      setPendingIds(prev => {
        const next = new Set(prev);
        next.delete(tempId);
        return next;
      });

    } catch (error) {
      console.error('Settlement failed, rolling back:', error);
      
      // ROLLBACK
      setTransactions(prevTransactions);
      setCurrentBalance(prevBalance);
      setPendingIds(prev => {
        const next = new Set(prev);
        next.delete(tempId);
        return next;
      });

      // Show error
      if (onError) {
        onError(error.response?.data?.error || 'Failed to settle. Please try again.');
      } else {
        alert('Failed to settle. Please try again.');
      }
    }
  }, [transactions, currentBalance]);

  /**
   * Check if a transaction is pending
   */
  const isTransactionPending = useCallback((txId) => {
    return pendingIds.has(txId);
  }, [pendingIds]);

  /**
   * Refresh transactions from server (for reconciliation after external changes)
   */
  const refreshTransactions = useCallback(async (contactId) => {
    if (!contactId) return;
    
    try {
      const response = await api.get(`/ledger/contacts/${contactId}`);
      setTransactions(response.data.transactions || []);
      setCurrentBalance(response.data.currentBalance || '0.00');
    } catch (error) {
      console.error('Failed to refresh transactions:', error);
    }
  }, []);

  const value = {
    // State
    transactions,
    currentBalance,
    currentContactId,
    pendingIds,
    
    // Actions
    initializeForContact,
    addTransactionOptimistic,
    settleContactOptimistic,
    isTransactionPending,
    refreshTransactions,
    
    // Direct setters for compatibility
    setTransactions,
    setCurrentBalance
  };

  return (
    <LedgerContext.Provider value={value}>
      {children}
    </LedgerContext.Provider>
  );
};

export default LedgerContext;
