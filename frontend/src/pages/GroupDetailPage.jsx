import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, User, Trash2, UserPlus } from 'lucide-react';
import { format } from 'date-fns';
import api from '../services/api';
import AddMemberModal from '../components/AddMemberModal';

const GroupDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [group, setGroup] = useState(null);
    const [members, setMembers] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [balances, setBalances] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Add Member Modal State
    const [showAddMemberModal, setShowAddMemberModal] = useState(false);

    useEffect(() => {
        fetchGroupDetail();
        fetchBalances();
    }, [id]);

    const fetchGroupDetail = async () => {
        try {
            const response = await api.get(`/groups/${id}`);
            setGroup(response.data.group);
            setMembers(response.data.members);
            setExpenses(response.data.expenses);
        } catch (err) {
            console.error('Failed to fetch group:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchBalances = async () => {
        try {
            const response = await api.get(`/groups/${id}/balances`);
            setBalances(response.data.balances);
        } catch (err) {
            console.error('Failed to fetch balances:', err);
        }
    };

    const handleMemberAdded = async () => {
        // Refresh group data
        await fetchGroupDetail();
        await fetchBalances();
    };

    const handleDelete = async () => {
        if (!confirm('Delete this group? All expenses will be removed.')) return;

        try {
            await api.delete(`/groups/${id}`);
            navigate('/groups');
        } catch (err) {
            console.error('Failed to delete group:', err);
            alert('Failed to delete group');
        }
    };

    const getBalanceColor = (balance) => {
        const bal = parseFloat(balance);
        if (bal > 0) return 'text-green-600';
        if (bal < 0) return 'text-red-600';
        return 'text-gray-500';
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-xl font-bold text-gray-900">{group?.name}</h1>
                    </div>
                    <button
                        onClick={handleDelete}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="page-container">
                {/* Members */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-bold text-gray-900">Members</h2>
                        <button
                            onClick={() => setShowAddMemberModal(true)}
                            className="btn bg-green-600 hover:bg-green-700 text-white px-3 py-2 text-sm flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Add Member</span>
                        </button>
                    </div>
                    <div className="space-y-2">
                        {balances.map((balance) => (
                            <div key={balance.user_id} className="card">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                                            <User className="w-5 h-5 text-primary-600" />
                                        </div>
                                        <p className="font-medium text-gray-900">{balance.user_name}</p>
                                    </div>
                                    <p className={`font-bold ${getBalanceColor(balance.balance)}`}>
                                        {parseFloat(balance.balance) > 0 ? '+' : ''}₹{parseFloat(balance.balance).toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <Link
                        to={`/groups/${id}/add-expense`}
                        className="btn btn-primary text-center flex items-center justify-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Expense</span>
                    </Link>
                    <Link
                        to={`/settlements?groupId=${id}`}
                        className="btn btn-secondary text-center"
                    >
                        View Settlements
                    </Link>
                </div>

                {/* Expenses */}
                <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-3">Expenses</h2>
                    {expenses.length > 0 ? (
                        <div className="space-y-2">
                            {expenses.map((expense) => (
                                <div key={expense.id} className="card">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="font-medium text-gray-900">{expense.description}</p>
                                            <p className="text-sm text-gray-600">
                                                Paid by {expense.payer?.name || 'Unknown'}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-900">₹{parseFloat(expense.amount).toFixed(2)}</p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        {format(new Date(expense.date), 'MMM d, yyyy')}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="card text-center py-8">
                            <p className="text-gray-500">No expenses yet</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Member Modal */}
            <AddMemberModal
                isOpen={showAddMemberModal}
                onClose={() => setShowAddMemberModal(false)}
                groupId={id}
                onMemberAdded={handleMemberAdded}
            />
        </div>
    );
};

export default GroupDetailPage;
