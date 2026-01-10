import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { TrendingUp, CheckCircle2 } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import api from '../services/api';

const SettlementsPage = () => {
    const [searchParams] = useSearchParams();
    const groupId = searchParams.get('groupId');
    const [settlements, setSettlements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSettlements();
    }, []);

    const fetchSettlements = async () => {
        try {
            if (groupId) {
                const response = await api.get(`/settlements/group/${groupId}`);
                if (response.data.mock || !response.data.settlements) {
                    setSettlements([]);
                } else {
                    setSettlements((response.data.settlements || []).map(s => ({ ...s, group_id: groupId })));
                }
            } else {
                const response = await api.get('/settlements/all');
                if (response.data.mock || !response.data.settlements) {
                    setSettlements([]);
                } else {
                    setSettlements(response.data.settlements || []);
                }
            }
        } catch (err) {
            console.error('Failed to fetch settlements:', err);
            setSettlements([]);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkPaid = async (settlement) => {
        try {
            await api.post('/settlements/mark-paid', {
                group_id: settlement.group_id,
                from_user: settlement.from_user_id,
                to_user: settlement.to_user_id,
                amount: settlement.amount,
            });

            alert('Settlement marked as paid!');
            fetchSettlements();
        } catch (err) {
            console.error('Failed to mark settlement:', err);
            alert('Failed to mark settlement');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
                <h1 className="text-2xl font-bold text-gray-900">Settlements</h1>
                <p className="text-sm text-gray-600 mt-1">Simplified payment suggestions</p>
            </div>

            <div className="page-container">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    </div>
                ) : settlements.length > 0 ? (
                    <div className="space-y-4">
                        {groupId && (
                            <div className="card bg-blue-50 border-blue-200">
                                <p className="text-sm text-blue-800">
                                    💡 These are optimized settlements to minimize transactions
                                </p>
                            </div>
                        )}

                        {settlements.map((settlement, index) => (
                            <div key={index} className="card">
                                {settlement.group_name && (
                                    <p className="text-xs text-gray-500 mb-2">{settlement.group_name}</p>
                                )}
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-600">
                                            <span className="font-medium text-gray-900">{settlement.from_user_name}</span>
                                            {' pays '}
                                            <span className="font-medium text-gray-900">{settlement.to_user_name}</span>
                                        </p>
                                        <p className="text-2xl font-bold text-primary-600 mt-1">
                                            ₹{parseFloat(settlement.amount).toFixed(2)}
                                        </p>
                                    </div>
                                    <div className="flex-shrink-0 ml-4">
                                        <TrendingUp className="w-8 h-8 text-primary-600" />
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleMarkPaid(settlement)}
                                    className="btn btn-primary w-full flex items-center justify-center gap-2 text-sm"
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>Mark as Paid</span>
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="card text-center py-12 mt-6">
                        <TrendingUp className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500 font-medium">All settled up!</p>
                        <p className="text-sm text-gray-400 mt-1">No pending settlements</p>
                    </div>
                )}
            </div>

            <BottomNav />
        </div>
    );
};

export default SettlementsPage;
