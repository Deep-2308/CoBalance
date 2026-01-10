import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import api from '../services/api';

const AddGroupPage = () => {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await api.post('/groups', { name, members: [] });
            navigate(`/groups/${response.data.group.id}`);
        } catch (err) {
            console.error('Failed to create group:', err);
            alert('Failed to create group');
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
                    <h1 className="text-xl font-bold text-gray-900">Create Group</h1>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="page-container">
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Group Name *
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="input"
                        placeholder="e.g., Goa Trip, Apartment Rent, etc."
                        required
                    />
                </div>

                <div className="mb-6">
                    <p className="text-sm text-gray-600">
                        You can add members after creating the group
                    </p>
                </div>

                <button
                    type="submit"
                    disabled={loading || !name}
                    className="btn btn-primary w-full flex items-center justify-center gap-2"
                >
                    <Save className="w-4 h-4" />
                    <span>{loading ? 'Creating...' : 'Create Group'}</span>
                </button>
            </form>
        </div>
    );
};

export default AddGroupPage;
