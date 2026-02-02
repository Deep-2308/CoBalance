import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowUpRight, ArrowDownRight, User, Settings2 } from 'lucide-react';
import { parseTransactionString } from '../../utils/parserService';
import api from '../../services/api';

/**
 * SmartEntry - Magic Input Component
 * 
 * A natural language transaction input that parses text like
 * "500 to Deep for Pizza" into structured transactions.
 */
const SmartEntry = () => {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState('');
  const [contacts, setContacts] = useState([]);
  const [parsedResult, setParsedResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // Fetch contacts on mount
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await api.get('/ledger/contacts');
        setContacts(response.data.contacts || []);
      } catch (err) {
        // Silently fail - will show "Unknown" for contacts
      }
    };
    fetchContacts();
  }, []);

  // Parse input in real-time
  useEffect(() => {
    if (inputValue.trim()) {
      const result = parseTransactionString(inputValue, contacts);
      setParsedResult(result);
    } else {
      setParsedResult(null);
    }
    setError('');
  }, [inputValue, contacts]);

  // Check if submission is valid
  const isValidSubmission = parsedResult && 
    parsedResult.amount !== null && 
    parsedResult.amount > 0 &&
    parsedResult.contactId !== null;

  // Handle form submission
  const handleSubmit = useCallback(async (e) => {
    e?.preventDefault();
    
    if (!isValidSubmission || isSubmitting) return;

    setIsSubmitting(true);
    setError('');

    try {
      // Prepare transaction payload
      const payload = {
        contact_id: parsedResult.contactId,
        amount: parsedResult.amount,
        // paid = credit (You paid → they owe you)
        // received = debit (You received → you owe them)
        transaction_type: parsedResult.direction === 'paid' ? 'credit' : 'debit',
        note: parsedResult.note || '',
        date: new Date().toISOString().split('T')[0],
        category: 'other'
      };

      await api.post('/ledger/transactions', payload);
      
      // Show success feedback
      setShowSuccess(true);
      setInputValue('');
      setParsedResult(null);
      
      // Hide success after 2 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add transaction');
    } finally {
      setIsSubmitting(false);
    }
  }, [parsedResult, isSubmitting, isValidSubmission]);

  // Handle Enter key
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name || name === 'Unknown') return '?';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-3">
      {/* Main Input */}
      <div className="relative">
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <Sparkles className="w-5 h-5 text-accent-500" />
        </div>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ex: 500 to Deep for Pizza..."
          className="w-full pl-12 pr-4 py-4 text-lg rounded-2xl border-2 border-surface-200 
                     bg-white shadow-soft-md focus:border-accent-400 focus:ring-2 
                     focus:ring-accent-200 focus:outline-none transition-all duration-200
                     placeholder:text-surface-400 font-sans"
          disabled={isSubmitting}
          autoComplete="off"
        />
        
        {/* Advanced/Manual link */}
        <Link
          to="/ledger/add-transaction"
          className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 
                     text-surface-400 hover:text-surface-600 transition-colors"
          title="Manual Entry"
        >
          <Settings2 className="w-5 h-5" />
        </Link>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="bg-success-50 border border-success-200 rounded-xl p-4 
                        flex items-center gap-3 animate-fade-in">
          <div className="w-10 h-10 bg-success-100 rounded-full flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5 text-success-600" />
          </div>
          <div>
            <p className="font-display font-semibold text-success-700">Transaction Added!</p>
            <p className="text-sm text-success-600">Your transaction has been saved</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-danger-50 border border-danger-200 rounded-xl p-4 text-danger-700 text-sm">
          {error}
        </div>
      )}

      {/* Live Preview Card */}
      {parsedResult && inputValue.trim() && !showSuccess && (
        <div className={`card transition-all duration-200 ${
          isValidSubmission 
            ? 'border-accent-200 shadow-soft-md' 
            : 'border-surface-200 opacity-80'
        }`}>
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-display font-semibold text-sm ${
              parsedResult.contactId 
                ? 'bg-gradient-to-br from-primary-100 to-primary-200 text-primary-700'
                : 'bg-surface-100 text-surface-400'
            }`}>
              {parsedResult.contactId ? (
                getInitials(parsedResult.contactName)
              ) : (
                <User className="w-5 h-5" />
              )}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              {/* Contact Name */}
              <p className={`font-display font-semibold truncate ${
                parsedResult.contactId ? 'text-primary-900' : 'text-surface-400'
              }`}>
                {parsedResult.contactName}
              </p>

              {/* Direction & Amount */}
              <div className="flex items-center gap-2 mt-0.5">
                {parsedResult.direction === 'paid' ? (
                  <>
                    <ArrowUpRight className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-green-600 font-medium">You Paid</span>
                  </>
                ) : (
                  <>
                    <ArrowDownRight className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <span className="text-sm text-red-600 font-medium">You Received</span>
                  </>
                )}
                {parsedResult.amount !== null && (
                  <span className={`font-display font-bold ${
                    parsedResult.direction === 'paid' ? 'text-green-700' : 'text-red-700'
                  }`}>
                    ₹{parsedResult.amount.toLocaleString('en-IN')}
                  </span>
                )}
              </div>

              {/* Note */}
              {parsedResult.note && (
                <p className="text-xs text-surface-500 mt-1 truncate">
                  {parsedResult.note}
                </p>
              )}
            </div>

            {/* Submit indication */}
            {isValidSubmission && (
              <div className="flex-shrink-0 text-right">
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="btn btn-accent py-2 px-4 text-sm"
                >
                  {isSubmitting ? 'Adding...' : 'Add'}
                </button>
              </div>
            )}
          </div>

          {/* Validation hint */}
          {!isValidSubmission && (
            <div className="mt-3 pt-3 border-t border-surface-100">
              <p className="text-xs text-surface-400">
                {!parsedResult.amount && '💡 Add an amount (e.g., "500", "1k")'}
                {parsedResult.amount && !parsedResult.contactId && '💡 Add a contact name that matches your contacts'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Helper text when empty */}
      {!inputValue.trim() && !showSuccess && (
        <p className="text-xs text-surface-400 text-center">
          Type naturally: "500 to John for lunch" or "1k from Deep"
        </p>
      )}
    </div>
  );
};

export default SmartEntry;
