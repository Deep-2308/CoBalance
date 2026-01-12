import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Users as UsersIcon, User } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import SearchBar from '../components/SearchBar';
import api from '../services/api';

const GroupsPage = () => {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        try {
            const response = await api.get('/groups');
            if (response.data.mock || !response.data.groups) {
                setGroups([]);
            } else {
                setGroups(response.data.groups || []);
            }
        } catch (err) {
            console.error('Failed to fetch groups:', err);
            setGroups([]);
        } finally {
            setLoading(false);
        }
    };

    // Client-side filtering for groups (list is typically small)
    const filteredGroups = groups.filter(group =>
        group.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
                <h1 className="text-2xl font-bold text-gray-900 mb-3">Groups</h1>
                
                {/* Search */}
                <SearchBar
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder="Search groups..."
                />
            </div>

            <div className="page-container">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    </div>
                ) : filteredGroups.length > 0 ? (
                    <div className="space-y-3">
                        {filteredGroups.map((group) => (
                            <Link
                                key={group.id}
                                to={`/groups/${group.id}`}
                                className="card hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                                            <UsersIcon className="w-6 h-6 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{group.name}</p>
                                            <p className="text-sm text-gray-500 flex items-center gap-1">
                                                <User className="w-3 h-3" />
                                                {group.memberCount} {group.memberCount === 1 ? 'member' : 'members'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="card text-center py-12 mt-6">
                        <UsersIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500 font-medium">
                            {searchTerm ? 'No groups match your search' : 'No groups yet'}
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                            {searchTerm 
                                ? 'Try a different search term' 
                                : 'Create a group to track shared expenses'}
                        </p>
                    </div>
                )}
            </div>

            <Link
                to="/groups/add"
                className="fixed bottom-24 right-6 bg-primary-600 hover:bg-primary-700 text-white rounded-full p-4 shadow-lg active:scale-95 transition-transform z-20"
            >
                <Plus className="w-6 h-6" />
            </Link>

            <BottomNav />
        </div>
    );
};

export default GroupsPage;
