import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Users, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const AddExpensePage = () => {
    const { id: groupId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    // Form State
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [paidBy, setPaidBy] = useState('');
    const [members, setMembers] = useState([]);
    const [selectedMembers, setSelectedMembers] = useState({});
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(false);
    const [showPaidByModal, setShowPaidByModal] = useState(false);

    useEffect(() => {
        fetchGroupDetail();
    }, [groupId]);

    useEffect(() => {
        if (user && !paidBy) {
            setPaidBy(user.id);
        }
    }, [user]);

    const fetchGroupDetail = async () => {
        try {
            const response = await api.get(`/groups/${groupId}`);
            const groupMembers = response.data.members || [];
            setMembers(groupMembers);

            // Initialize with all members selected by default
            const initialSelection = {};
            groupMembers.forEach(member => {
                initialSelection[member.id] = true;
            });
            setSelectedMembers(initialSelection);
        } catch (err) {
            console.error('Failed to fetch group:', err);
            alert('Failed to load group details');
        }
    };

    // Calculate split amounts in real-time
    const splitCalculation = useMemo(() => {
        const totalAmount = parseFloat(amount) || 0;
        const selectedCount = Object.values(selectedMembers).filter(Boolean).length;
        const perPerson = selectedCount > 0 ? totalAmount / selectedCount : 0;

        return {
            totalAmount,
            selectedCount,
            perPerson: perPerson.toFixed(2)
        };
    }, [amount, selectedMembers]);

    const handleMemberToggle = (memberId) => {
        setSelectedMembers(prev => ({
            ...prev,
            [memberId]: !prev[memberId]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!description.trim()) {
            alert('Please add a description');
            return;
        }

        if (!amount || parseFloat(amount) <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        if (splitCalculation.selectedCount === 0) {
            alert('Please select at least one person to split with');
            return;
        }

        setLoading(true);

        try {
            // Build split_between array
            const splits = members
                .filter(member => selectedMembers[member.id])
                .map(member => ({
                    user_id: member.id,
                    amount: splitCalculation.perPerson
                }));

            const payload = {
                description: description.trim(),
                amount: splitCalculation.totalAmount.toFixed(2),
                paid_by: paidBy,
                split_between: splits,
                date
            };

            await api.post(`/groups/${groupId}/expenses`, payload);

            // Navigate back to group detail
            navigate(`/groups/${groupId}`);
        } catch (err) {
            console.error('Failed to add expense:', err);
            alert(err.response?.data?.error || 'Failed to add expense');
        } finally {
            setLoading(false);
        }
    };

    const paidByMember = members.find(m => m.id === paidBy);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-xl font-bold text-gray-900">Add Expense</h1>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="page-container pb-24">
                {/* Description */}
                <div className="mb-6">
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="input text-lg"
                        placeholder="Enter description (e.g., Lunch, Movie)"
                        autoFocus
                        required
                    />
                </div>

                {/* Amount - Big and Bold */}
                <div className="mb-6">
                    <div className="text-center">
                        <div className="relative inline-block">
                            <span className="absolute left-0 top-1/2 transform -translate-y-1/2 text-4xl font-bold text-gray-900">
                                ₹
                            </span>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="text-5xl font-bold text-center text-gray-900 bg-transparent border-0 outline-none pl-12 pr-4 w-full"
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                                required
                                style={{ 
                                    width: `${Math.max(6, (amount.length || 1) + 3)}ch`
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Paid By */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Paid by
                    </label>
                    <button
                        type="button"
                        onClick={() => setShowPaidByModal(true)}
                        className="w-full card hover:bg-gray-50 transition-colors text-left"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                    <span className="text-primary-700 font-semibold">
                                        {paidByMember?.name?.charAt(0)?.toUpperCase() || 'Y'}
                                    </span>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">
                                        {paidByMember?.id === user?.id ? 'You' : paidByMember?.name || 'Select'}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {paidByMember?.mobile || 'Tap to change'}
                                    </p>
                                </div>
                            </div>
                            <div className="text-primary-600 text-sm font-medium">
                                Change
                            </div>
                        </div>
                    </button>
                </div>

                {/* Split Info */}
                <div className="mb-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Users className="w-5 h-5 text-blue-600" />
                                <span className="text-sm font-medium text-blue-900">
                                    Split equally
                                </span>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-blue-700">
                                    {splitCalculation.selectedCount} {splitCalculation.selectedCount === 1 ? 'person' : 'people'}
                                </p>
                                <p className="text-lg font-bold text-blue-900">
                                    ₹{splitCalculation.perPerson} each
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Member Selection */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Split with ({splitCalculation.selectedCount}/{members.length} selected)
                    </label>
                    <div className="space-y-2">
                        {members.map((member) => {
                            const isSelected = selectedMembers[member.id];
                            const isYou = member.id === user?.id;

                            return (
                                <div
                                    key={member.id}
                                    onClick={() => handleMemberToggle(member.id)}
                                    className={`card cursor-pointer transition-all ${
                                        isSelected
                                            ? 'border-primary-600 bg-primary-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                                isSelected ? 'bg-primary-100' : 'bg-gray-100'
                                            }`}>
                                                <span className={`font-semibold ${
                                                    isSelected ? 'text-primary-700' : 'text-gray-600'
                                                }`}>
                                                    {member.name?.charAt(0)?.toUpperCase()}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {isYou ? 'You' : member.name}
                                                </p>
                                                {isSelected && (
                                                    <p className="text-sm font-medium text-primary-600">
                                                        ₹{splitCalculation.perPerson}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                                            isSelected
                                                ? 'bg-primary-600 border-primary-600'
                                                : 'border-gray-300'
                                        }`}>
                                            {isSelected && <Check className="w-4 h-4 text-white" />}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Date */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date
                    </label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="input"
                        required
                    />
                </div>

                {/* Submit Button - Fixed at bottom */}
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
                    <button
                        type="submit"
                        disabled={loading || !description || !amount || splitCalculation.selectedCount === 0}
                        className="btn btn-primary w-full flex items-center justify-center gap-2 text-lg py-4 disabled:opacity-50"
                    >
                        <Save className="w-5 h-5" />
                        <span>{loading ? 'Saving...' : 'Save Expense'}</span>
                    </button>
                </div>
            </form>

            {/* Paid By Modal */}
            {showPaidByModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50"
                        onClick={() => setShowPaidByModal(false)}
                    ></div>
                    <div className="flex items-end sm:items-center justify-center min-h-screen">
                        <div className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-xl max-w-md w-full p-6 animate-scale-in">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Who paid?</h3>
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {members.map((member) => {
                                    const isYou = member.id === user?.id;
                                    const isSelected = paidBy === member.id;

                                    return (
                                        <button
                                            key={member.id}
                                            type="button"
                                            onClick={() => {
                                                setPaidBy(member.id);
                                                setShowPaidByModal(false);
                                            }}
                                            className={`w-full card text-left p-4 transition-all ${
                                                isSelected
                                                    ? 'border-primary-600 bg-primary-50'
                                                    : 'hover:border-gray-300'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                                        isSelected ? 'bg-primary-100' : 'bg-gray-100'
                                                    }`}>
                                                        <span className={`font-semibold ${
                                                            isSelected ? 'text-primary-700' : 'text-gray-600'
                                                        }`}>
                                                            {member.name?.charAt(0)?.toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">
                                                            {isYou ? 'You' : member.name}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            {member.mobile}
                                                        </p>
                                                    </div>
                                                </div>
                                                {isSelected && (
                                                    <Check className="w-5 h-5 text-primary-600" />
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                            <button
                                onClick={() => setShowPaidByModal(false)}
                                className="btn btn-secondary w-full mt-4"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddExpensePage;
