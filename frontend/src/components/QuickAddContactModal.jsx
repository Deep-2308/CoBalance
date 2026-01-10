import { useState } from 'react';
import { X, UserPlus } from 'lucide-react';

const QuickAddContactModal = ({ isOpen, onClose, onContactAdded }) => {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [type, setType] = useState('customer');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    setSaving(true);

    try {
      // Call the onContactAdded callback with contact data
      await onContactAdded({ name: name.trim(), mobile, type });
      
      // Reset form
      setName('');
      setMobile('');
      setType('customer');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to add contact');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving) {
      setName('');
      setMobile('');
      setType('customer');
      setError('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      ></div>

      {/* Modal */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-scale-in">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <UserPlus className="w-5 h-5 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Quick Add Contact</h2>
            </div>
            <button
              onClick={handleClose}
              disabled={saving}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Name Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
                placeholder="Enter contact name"
                autoFocus
                required
              />
            </div>

            {/* Mobile Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Number (Optional)
              </label>
              <div className="flex">
                <div className="flex items-center px-4 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg">
                  <span className="text-gray-600">+91</span>
                </div>
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                  className="input rounded-l-none flex-1"
                  placeholder="9876543210"
                  maxLength="10"
                />
              </div>
            </div>

            {/* Type Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Type
              </label>
              <div className="grid grid-cols-4 gap-2">
                {['customer', 'friend', 'supplier', 'other'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                      type === t
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={saving}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !name.trim()}
                className="btn btn-primary flex-1 flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save & Select'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default QuickAddContactModal;
