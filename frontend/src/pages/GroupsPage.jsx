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

    // Get initials from group name
    const getInitials = (name) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="min-h-screen bg-surface-50">
            {/* Header */}
            <div className="page-header">
                <h1 className="text-2xl font-display font-bold text-primary-900 mb-3">Groups</h1>
                
                {/* Search */}
                <SearchBar
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder="Search groups..."
                />
            </div>

            <div className="page-container">
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-10 h-10 border-3 border-primary-200 border-t-primary-800 rounded-full animate-spin"></div>
                            <p className="text-sm text-surface-500 font-medium">Loading groups...</p>
                        </div>
                    </div>
                ) : filteredGroups.length > 0 ? (
                    <div className="space-y-2">
                        {filteredGroups.map((group, index) => (
                            <Link
                                key={group.id}
                                to={`/groups/${group.id}`}
                                className="card card-interactive block"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        {/* Group Avatar */}
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-100 to-accent-200 flex items-center justify-center flex-shrink-0">
                                            <span className="text-sm font-display font-bold text-accent-700">
                                                {getInitials(group.name)}
                                            </span>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-display font-semibold text-primary-900 truncate">
                                                {group.name}
                                            </p>
                                            <p className="text-xs text-surface-400 flex items-center gap-1">
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
                    <div className="card empty-state mt-6">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface-100 flex items-center justify-center">
                            <UsersIcon className="w-8 h-8 text-surface-300" />
                        </div>
                        <p className="empty-state-title">
                            {searchTerm ? 'No groups match your search' : 'No groups yet'}
                        </p>
                        <p className="empty-state-text">
                            {searchTerm 
                                ? 'Try a different search term' 
                                : 'Create a group to track shared expenses'}
                        </p>
                    </div>
                )}
            </div>

            {/* Floating Add Button */}
            <Link
                to="/groups/add"
                className="fab"
                aria-label="Create group"
            >
                <Plus className="w-6 h-6" />
            </Link>

            <BottomNav />
        </div>
    );
};

export default GroupsPage;
