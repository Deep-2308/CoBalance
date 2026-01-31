import { useState, useEffect, useCallback } from 'react';
import { Divide, DollarSign, Percent, AlertCircle, Check, Users } from 'lucide-react';
import {
  splitEqually,
  splitByAmount,
  splitByPercentage,
  validateSplit,
  formatSplitDetails,
} from '../utils/splitLogic';

/**
 * SplitBillEngine Component
 * 
 * Allows splitting an expense among multiple participants using:
 * - Equal: Divide equally with rounding adjustment
 * - Amount: Manual amount entry per participant
 * - Percentage: Percentage-based split converted to amounts
 * 
 * Props:
 * @param {number} totalAmount - Amount to split
 * @param {Array<{id: string, name: string}>} participants - List of participants
 * @param {function} onSubmit - Callback with split result: (splitDetails) => void
 */
const SplitBillEngine = ({ totalAmount, participants = [], onSubmit }) => {
  const [mode, setMode] = useState('equal');
  const [manualAmounts, setManualAmounts] = useState({});
  const [manualPercentages, setManualPercentages] = useState({});
  const [splits, setSplits] = useState([]);
  const [validation, setValidation] = useState({ isValid: false, remaining: 0, error: null });

  // Initialize manual inputs when participants change
  useEffect(() => {
    const amounts = {};
    const percentages = {};
    participants.forEach(p => {
      amounts[p.id] = '';
      percentages[p.id] = '';
    });
    setManualAmounts(amounts);
    setManualPercentages(percentages);
  }, [participants]);

  // Calculate splits based on mode
  const calculateSplits = useCallback(() => {
    if (!participants || participants.length === 0) {
      setSplits([]);
      setValidation({ isValid: false, remaining: totalAmount, error: 'No participants selected' });
      return;
    }

    let result;

    switch (mode) {
      case 'equal':
        result = splitEqually(totalAmount, participants);
        setSplits(result);
        setValidation(validateSplit(totalAmount, result));
        break;

      case 'amount':
        const amountEntries = participants.map(p => ({
          userId: p.id,
          name: p.name,
          amount: parseFloat(manualAmounts[p.id]) || 0,
        }));
        const amountResult = splitByAmount(totalAmount, amountEntries);
        setSplits(amountResult.splits);
        setValidation({
          isValid: amountResult.isValid,
          remaining: amountResult.remaining,
          error: amountResult.remaining !== 0 
            ? amountResult.remaining > 0 
              ? `₹${amountResult.remaining.toFixed(2)} remaining`
              : `₹${Math.abs(amountResult.remaining).toFixed(2)} excess`
            : null,
        });
        break;

      case 'percentage':
        const percentageEntries = participants.map(p => ({
          userId: p.id,
          name: p.name,
          percentage: parseFloat(manualPercentages[p.id]) || 0,
        }));
        const percentageResult = splitByPercentage(totalAmount, percentageEntries);
        setSplits(percentageResult.splits);
        setValidation({
          isValid: percentageResult.isValid,
          remaining: 0,
          error: !percentageResult.isValid 
            ? `Percentages must equal 100% (current: ${percentageResult.percentageTotal}%)`
            : null,
        });
        break;

      default:
        setSplits([]);
        setValidation({ isValid: false, remaining: totalAmount, error: 'Invalid mode' });
    }
  }, [mode, totalAmount, participants, manualAmounts, manualPercentages]);

  // Recalculate when inputs change
  useEffect(() => {
    calculateSplits();
  }, [calculateSplits]);

  // Handle amount input change
  const handleAmountChange = (userId, value) => {
    setManualAmounts(prev => ({
      ...prev,
      [userId]: value,
    }));
  };

  // Handle percentage input change
  const handlePercentageChange = (userId, value) => {
    setManualPercentages(prev => ({
      ...prev,
      [userId]: value,
    }));
  };

  // Handle submit
  const handleSubmit = () => {
    if (!validation.isValid) return;
    
    const splitDetails = formatSplitDetails(mode, splits);
    onSubmit(splitDetails);
  };

  // Get initials for avatar
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(w => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  // Mode button styles
  const getModeButtonClass = (buttonMode) => {
    const base = 'flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-display font-medium text-sm transition-all duration-200';
    if (mode === buttonMode) {
      return `${base} bg-primary-800 text-white shadow-soft`;
    }
    return `${base} bg-surface-100 text-surface-600 hover:bg-surface-200`;
  };

  if (!participants || participants.length === 0) {
    return (
      <div className="card">
        <div className="empty-state">
          <Users className="empty-state-icon" />
          <p className="empty-state-title">No participants</p>
          <p className="empty-state-text">Add participants to split the bill</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Mode Selector */}
      <div className="card p-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode('equal')}
            className={getModeButtonClass('equal')}
          >
            <Divide className="w-4 h-4" />
            Equal
          </button>
          <button
            type="button"
            onClick={() => setMode('amount')}
            className={getModeButtonClass('amount')}
          >
            <DollarSign className="w-4 h-4" />
            Amount
          </button>
          <button
            type="button"
            onClick={() => setMode('percentage')}
            className={getModeButtonClass('percentage')}
          >
            <Percent className="w-4 h-4" />
            Percent
          </button>
        </div>
      </div>

      {/* Total Amount Display */}
      <div className="card bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
        <div className="text-center">
          <p className="text-sm text-primary-600 font-medium mb-1">Total Amount</p>
          <p className="text-3xl font-display font-bold text-primary-900">₹{totalAmount.toFixed(2)}</p>
        </div>
      </div>

      {/* Participant List */}
      <div className="card">
        <h3 className="section-title">Split with ({participants.length} people)</h3>
        <div className="space-y-3">
          {participants.map((participant, index) => (
            <div
              key={participant.id}
              className="flex items-center gap-3 p-3 bg-surface-50 rounded-xl"
            >
              {/* Avatar */}
              <div className="avatar avatar-sm">
                {getInitials(participant.name)}
              </div>

              {/* Name & Split Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-surface-900 truncate">{participant.name}</p>
                {mode === 'equal' && splits[index] && (
                  <p className="text-sm text-surface-500">
                    ₹{splits[index].amount.toFixed(2)}
                    {index === 0 && splits.length > 1 && (
                      <span className="text-xs text-primary-600 ml-1">(+rounding)</span>
                    )}
                  </p>
                )}
              </div>

              {/* Input Field (for amount/percentage modes) */}
              {mode === 'amount' && (
                <div className="w-28">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400">₹</span>
                    <input
                      type="number"
                      value={manualAmounts[participant.id] || ''}
                      onChange={(e) => handleAmountChange(participant.id, e.target.value)}
                      placeholder="0.00"
                      className="input pl-7 py-2 text-right text-sm"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              )}

              {mode === 'percentage' && (
                <div className="w-24">
                  <div className="relative">
                    <input
                      type="number"
                      value={manualPercentages[participant.id] || ''}
                      onChange={(e) => handlePercentageChange(participant.id, e.target.value)}
                      placeholder="0"
                      className="input pr-7 py-2 text-right text-sm"
                      min="0"
                      max="100"
                      step="1"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400">%</span>
                  </div>
                </div>
              )}

              {/* Show calculated amount for percentage mode */}
              {mode === 'percentage' && splits[index] && (
                <div className="w-20 text-right">
                  <p className="text-sm font-medium text-surface-700">
                    ₹{splits[index].amount.toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Validation Message */}
      {validation.error && (
        <div className="card bg-danger-50 border-danger-200">
          <div className="flex items-center gap-2 text-danger-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">{validation.error}</p>
          </div>
        </div>
      )}

      {/* Success Indicator */}
      {validation.isValid && (
        <div className="card bg-success-50 border-success-200">
          <div className="flex items-center gap-2 text-success-700">
            <Check className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">Split is valid and ready to submit</p>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!validation.isValid}
        className="btn btn-accent w-full"
      >
        <Check className="w-5 h-5 mr-2" />
        Confirm Split
      </button>
    </div>
  );
};

export default SplitBillEngine;
