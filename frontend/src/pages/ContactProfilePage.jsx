import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, Users, Receipt } from 'lucide-react';
import api from '../services/api';

const ContactProfilePage = () => {
  const { id: contactId } = useParams();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('ledger'); // 'ledger' or 'groups'
  const [loading, setLoading] = useState(true);
  const [settleAmount, setSettleAmount] = useState('');
  const [settleNote, setSettleNote] = useState('');
  const [settling, setSettling] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [contactId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/contacts/${contactId}/profile`);
      setProfile(response.data);
      
      // Pre-fill settle amount with total balance
      const balance = parseFloat(response.data.balance.total_net_balance);
      if (balance !== 0) {
        setSettleAmount(Math.abs(balance).toFixed(2));
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      alert('Failed to load contact profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSettle = async () => {
    if (!settleAmount || parseFloat(settleAmount) === 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (!confirm(`Settle ₹${settleAmount} with ${profile.contact.name}?`)) {
      return;
    }

    try {
      setSettling(true);
      
      const balance = parseFloat(profile.balance.total_net_balance);
      const amount = balance > 0 ? -parseFloat(settleAmount) : parseFloat(settleAmount);

      await api.post(`/contacts/${contactId}/settle`, {
        amount: amount.toFixed(2),
        note: settleNote || `Settlement - ${new Date().toLocaleDateString()}`
      });

      alert('Settlement recorded successfully!');
      fetchProfile(); // Refresh data
      setSettleNote('');
    } catch (err) {
      console.error('Settlement failed:', err);
      alert('Failed to record settlement');
    } finally {
      setSettling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <p className="text-center text-gray-500">Contact not found</p>
      </div>
    );
  }

  const balance = parseFloat(profile.balance.total_net_balance);
  const isPositive = balance > 0;
  const isZero = balance === 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{profile.contact.name}</h1>
            <p className="text-sm text-gray-500 capitalize">{profile.contact.type}</p>
          </div>
        </div>
      </div>

      {/* Big Balance Card */}
      <div className="p-4">
        <div className={`card ${isZero ? 'bg-gray-50' : isPositive ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Total Net Balance</p>
            <div className="flex items-center justify-center gap-2">
              {!isZero && (
                isPositive ? (
                  <TrendingUp className="w-8 h-8 text-green-600" />
                ) : (
                  <TrendingDown className="w-8 h-8 text-red-600" />
                )
              )}
              <h2 className={`text-4xl font-bold ${
                isZero ? 'text-gray-900' : isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                ₹{Math.abs(balance).toFixed(2)}
              </h2>
            </div>
            <p className={`text-sm mt-2 font-medium ${
              isZero ? 'text-gray-600' : isPositive ? 'text-green-700' : 'text-red-700'
            }`}>
              {isZero ? '✓ All Settled Up' : isPositive ? "You'll Get" : 'You Owe'}
            </p>
          </div>

          {/* Balance Breakdown */}
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-xs text-gray-500">Ledger</p>
              <p className={`text-lg font-bold ${
                parseFloat(profile.balance.ledger_balance) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                ₹{Math.abs(parseFloat(profile.balance.ledger_balance)).toFixed(2)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Groups</p>
              <p className={`text-lg font-bold ${
                parseFloat(profile.balance.group_balance) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                ₹{Math.abs(parseFloat(profile.balance.group_balance)).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="card mt-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Mobile</p>
            <p className="font-medium text-gray-900">{profile.contact.mobile}</p>
          </div>
          {profile.contact.has_user_account ? (
            <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
              CoBalance User
            </span>
          ) : (
            <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
              Not Registered
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 mb-4">
        <div className="bg-white rounded-lg p-1 flex gap-1 shadow-sm">
          <button
            onClick={() => setActiveTab('ledger')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'ledger'
                ? 'bg-primary-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Receipt className="w-4 h-4" />
            Ledger ({profile.summary.total_transactions})
          </button>
          <button
            onClick={() => setActiveTab('groups')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'groups'
                ? 'bg-primary-600 text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Users className="w-4 h-4" />
            Groups ({profile.summary.shared_groups_count})
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-4">
        {activeTab === 'ledger' && (
          <div className="space-y-3">
            {profile.recent_activity.filter(a => a.type === 'ledger').length === 0 ? (
              <div className="card text-center py-8">
                <Receipt className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">No ledger transactions</p>
              </div>
            ) : (
              profile.recent_activity
                .filter(a => a.type === 'ledger')
                .map((activity, index) => (
                  <div key={index} className="card">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {activity.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(activity.date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${
                          activity.transaction_type === 'credit' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {activity.transaction_type === 'credit' ? '+' : '-'}₹{activity.amount}
                        </p>
                        <p className="text-xs text-gray-500">
                          {activity.transaction_type === 'credit' ? 'You get' : 'You owe'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        )}

        {activeTab === 'groups' && (
          <div className="space-y-4">
            {profile.shared_groups.length === 0 ? (
              <div className="card text-center py-8">
                <Users className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">No shared groups</p>
                <p className="text-xs text-gray-400 mt-1">
                  {profile.contact.has_user_account
                    ? 'Add this contact to a group'
                    : 'Contact needs to register on CoBalance'}
                </p>
              </div>
            ) : (
              profile.shared_groups.map((group) => (
                <div key={group.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary-600" />
                      {group.name}
                    </h3>
                    <p className={`text-sm font-medium ${
                      parseFloat(group.balance) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {parseFloat(group.balance) >= 0 ? '+' : ''}₹{group.balance}
                    </p>
                  </div>

                  <div className="space-y-2">
                    {profile.recent_activity
                      .filter(a => a.type === 'group' && a.group_id === group.id)
                      .slice(0, 3)
                      .map((activity, index) => (
                        <div key={index} className="card bg-gray-50">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {activity.description}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {activity.paid_by_you ? 'You paid' : `${profile.contact.name} paid`}
                                {' • '}
                                {new Date(activity.date).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short'
                                })}
                              </p>
                            </div>
                            <div className="text-right ml-3">
                              <p className="text-sm font-bold text-gray-900">₹{activity.amount}</p>
                              <p className="text-xs text-gray-500">
                                Your split: ₹{activity.your_split}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Settle Up Button */}
      {!isZero && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
          <div className="max-w-md mx-auto space-y-3">
            <div className="flex gap-2">
              <input
                type="number"
                value={settleAmount}
                onChange={(e) => setSettleAmount(e.target.value)}
                placeholder="Amount"
                className="input flex-1"
                step="0.01"
              />
              <button
                onClick={handleSettle}
                disabled={settling || !settleAmount}
                className="btn btn-primary px-6 flex items-center gap-2 disabled:opacity-50"
              >
                <DollarSign className="w-4 h-4" />
                {settling ? 'Settling...' : 'Settle Up'}
              </button>
            </div>
            <input
              type="text"
              value={settleNote}
              onChange={(e) => setSettleNote(e.target.value)}
              placeholder="Note (optional)"
              className="input w-full text-sm"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactProfilePage;
