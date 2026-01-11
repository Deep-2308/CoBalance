import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import api from '../services/api';

const AddContactPage = () => {
    const [name, setName] = useState('');
    const [mobile, setMobile] = useState('');
    const [type, setType] = useState('customer');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const types = [
        { value: 'customer', label: 'Customer' },
        { value: 'friend', label: 'Friend' },
        { value: 'supplier', label: 'Supplier' },
        { value: 'other', label: 'Other' },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post('/ledger/contacts', { name, type, mobile: mobile || null });
            navigate('/ledger');
        } catch (err) {
            console.error('Failed to create contact:', err);
            alert('Failed to create contact');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-xl font-bold text-gray-900">Add Contact</h1>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="page-container">
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contact Name *
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="input"
                        placeholder="Enter contact name"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mobile Number (for WhatsApp reminders)
                    </label>
                    <input
                        type="tel"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        className="input"
                        placeholder="+91 98765 43210"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Include country code (e.g., +91 for India)
                    </p>
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contact Type
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        {types.map((t) => (
                            <button
                                key={t.value}
                                type="button"
                                onClick={() => setType(t.value)}
                                className={`p-4 rounded-lg border-2 transition-all ${type === t.value
                                        ? 'border-primary-600 bg-primary-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <p className="font-medium text-gray-900">{t.label}</p>
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading || !name}
                    className="btn btn-primary w-full flex items-center justify-center gap-2"
                >
                    <Save className="w-4 h-4" />
                    <span>{loading ? 'Saving...' : 'Save Contact'}</span>
                </button>
            </form>
        </div>
    );
};

export default AddContactPage;
