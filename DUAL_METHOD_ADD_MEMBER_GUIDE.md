# Dual-Method Member Addition - Implementation Guide

## Overview

This guide implements a **two-method** member addition system:

1. **Import from Contacts** - Select from device contacts
2. **Manual Entry** - Enter details manually

Both methods create shadow/ghost accounts for unregistered users.

---

## API Specification

### Endpoint

```
POST /api/groups/:groupId/members
```

### Request Payload (Both Methods)

```javascript
{
  "mobile": "+919876543210",  // Required, formatted with country code
  "name": "Rahul Kumar"       // Optional, user-provided or from contacts
}
```

### Response (Success)

```json
{
  "success": true,
  "member": {
    "id": "uuid-123",
    "name": "Rahul Kumar",
    "mobile": "+919876543210"
  },
  "is_ghost_user": true,
  "sms_sent": true,
  "message": "Friend added! We'll send them an invite to join CoBalance."
}
```

---

## Frontend Implementation

### 1. Add Member Modal Component

**File:** `frontend/src/components/AddMemberModal.jsx`

```jsx
import { useState } from "react";
import { X, UserPlus, Users, Phone } from "lucide-react";
import api from "../services/api";

const AddMemberModal = ({ isOpen, onClose, groupId, onMemberAdded }) => {
  const [method, setMethod] = useState("manual"); // 'manual' or 'contacts'
  const [loading, setLoading] = useState(false);

  // Manual Entry State
  const [name, setName] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [mobile, setMobile] = useState("");

  // Contacts State
  const [contacts, setContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(false);

  // Request contacts permission and load
  const handleImportContacts = async () => {
    setMethod("contacts");
    setLoadingContacts(true);

    try {
      // For web: Use Contact Picker API (modern browsers)
      if ("contacts" in navigator && "ContactsManager" in window) {
        const props = ["name", "tel"];
        const opts = { multiple: true };

        const selectedContactsList = await navigator.contacts.select(
          props,
          opts
        );

        const formattedContacts = selectedContactsList.map(
          (contact, index) => ({
            id: `contact-${index}`,
            name: contact.name?.[0] || "Unknown",
            phones: contact.tel?.map(sanitizePhoneNumber) || [],
          })
        );

        setContacts(formattedContacts);
      } else {
        alert(
          "Contact picker not supported on this browser. Please use manual entry."
        );
        setMethod("manual");
      }
    } catch (err) {
      console.error("Failed to access contacts:", err);
      alert("Could not access contacts. Please use manual entry.");
      setMethod("manual");
    } finally {
      setLoadingContacts(false);
    }
  };

  // Sanitize phone number: remove spaces, dashes, parentheses
  const sanitizePhoneNumber = (phone) => {
    const cleaned = phone.replace(/[\s\-\(\)]/g, "");

    // Add country code if missing
    if (!cleaned.startsWith("+")) {
      return countryCode + cleaned;
    }

    return cleaned;
  };

  // Validate mobile number (10 digits for India)
  const isValidMobile = (num) => {
    return /^\d{10}$/.test(num);
  };

  // Handle manual entry submission
  const handleManualAdd = async (e) => {
    e.preventDefault();

    if (!name.trim() || !isValidMobile(mobile)) {
      alert("Please enter valid name and 10-digit mobile number");
      return;
    }

    setLoading(true);

    try {
      const formattedMobile = countryCode + mobile;

      const response = await api.post(`/groups/${groupId}/members`, {
        mobile: formattedMobile,
        name: name.trim(),
      });

      onMemberAdded(response.data.member);
      resetForm();
      onClose();
    } catch (err) {
      console.error("Failed to add member:", err);
      alert(err.response?.data?.error || "Failed to add member");
    } finally {
      setLoading(false);
    }
  };

  // Handle contacts selection
  const toggleContactSelection = (contact, phone) => {
    const key = `${contact.id}-${phone}`;

    setSelectedContacts((prev) => {
      const exists = prev.find((c) => c.key === key);

      if (exists) {
        return prev.filter((c) => c.key !== key);
      } else {
        return [
          ...prev,
          {
            key,
            name: contact.name,
            mobile: phone,
          },
        ];
      }
    });
  };

  // Add selected contacts
  const handleAddSelectedContacts = async () => {
    if (selectedContacts.length === 0) {
      alert("Please select at least one contact");
      return;
    }

    setLoading(true);

    try {
      // Add members in parallel
      const promises = selectedContacts.map((contact) =>
        api.post(`/groups/${groupId}/members`, {
          mobile: contact.mobile,
          name: contact.name,
        })
      );

      const results = await Promise.allSettled(promises);

      // Count successes
      const successes = results.filter((r) => r.status === "fulfilled");

      alert(`Added ${successes.length} of ${selectedContacts.length} members`);

      // Notify parent to refresh
      if (successes.length > 0) {
        onMemberAdded();
      }

      resetForm();
      onClose();
    } catch (err) {
      console.error("Failed to add contacts:", err);
      alert("Some contacts could not be added");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setMobile("");
    setContacts([]);
    setSelectedContacts([]);
    setMethod("manual");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={() => !loading && onClose()}
      ></div>

      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-scale-in">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Add Member</h2>
            <button
              onClick={onClose}
              disabled={loading}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Method Toggle */}
          <div className="grid grid-cols-2 gap-2 mb-6">
            <button
              type="button"
              onClick={() => setMethod("manual")}
              className={`py-3 px-4 rounded-lg border-2 transition-all ${
                method === "manual"
                  ? "border-primary-600 bg-primary-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <Phone className="w-5 h-5 mx-auto mb-1" />
              <p className="text-sm font-medium">Manual</p>
            </button>
            <button
              type="button"
              onClick={handleImportContacts}
              className={`py-3 px-4 rounded-lg border-2 transition-all ${
                method === "contacts"
                  ? "border-primary-600 bg-primary-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <Users className="w-5 h-5 mx-auto mb-1" />
              <p className="text-sm font-medium">Contacts</p>
            </button>
          </div>

          {/* Manual Entry Form */}
          {method === "manual" && (
            <form onSubmit={handleManualAdd}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input"
                  placeholder="e.g. Rahul Kumar"
                  autoFocus
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="input w-24"
                  >
                    <option value="+91">+91</option>
                    <option value="+1">+1</option>
                    <option value="+44">+44</option>
                    <option value="+971">+971</option>
                  </select>
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) =>
                      setMobile(e.target.value.replace(/\D/g, ""))
                    }
                    className="input flex-1"
                    placeholder="9876543210"
                    maxLength="10"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !name.trim() || !isValidMobile(mobile)}
                className="btn btn-primary w-full flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                {loading ? "Adding..." : "Add Member"}
              </button>
            </form>
          )}

          {/* Contacts List */}
          {method === "contacts" && (
            <div>
              {loadingContacts ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">
                    Loading contacts...
                  </p>
                </div>
              ) : contacts.length > 0 ? (
                <>
                  <div className="max-h-96 overflow-y-auto mb-4">
                    {contacts.map((contact) =>
                      contact.phones.map((phone, idx) => {
                        const key = `${contact.id}-${phone}`;
                        const isSelected = selectedContacts.some(
                          (c) => c.key === key
                        );

                        return (
                          <div
                            key={key}
                            onClick={() =>
                              toggleContactSelection(contact, phone)
                            }
                            className={`card cursor-pointer mb-2 ${
                              isSelected
                                ? "border-primary-600 bg-primary-50"
                                : ""
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-gray-900">
                                  {contact.name}
                                </p>
                                <p className="text-sm text-gray-500">{phone}</p>
                              </div>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {}}
                                className="w-5 h-5"
                              />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <button
                    onClick={handleAddSelectedContacts}
                    disabled={loading || selectedContacts.length === 0}
                    className="btn btn-primary w-full"
                  >
                    Add {selectedContacts.length} Selected
                  </button>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No contacts available</p>
                  <button
                    onClick={() => setMethod("manual")}
                    className="btn btn-secondary mt-4"
                  >
                    Use Manual Entry
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddMemberModal;
```

---

## Usage in GroupDetailPage

```jsx
import AddMemberModal from "../components/AddMemberModal";

const GroupDetailPage = () => {
  const [showAddModal, setShowAddModal] = useState(false);

  const handleMemberAdded = async (member) => {
    // Refresh group data
    await fetchGroupDetail();
    await fetchBalances();
  };

  return (
    <>
      {/* Add Member Button */}
      <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
        + Add Member
      </button>

      {/* Add Member Modal */}
      <AddMemberModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        groupId={groupId}
        onMemberAdded={handleMemberAdded}
      />
    </>
  );
};
```

---

## Contact Picker API Support

### Browser Compatibility

| Browser        | Support       |
| -------------- | ------------- |
| Chrome Android | ✅ Yes (v80+) |
| Safari iOS     | ❌ No         |
| Firefox        | ❌ No         |
| Desktop Chrome | ❌ No         |

### Fallback Strategy

For browsers without Contact Picker API:

1. Show manual entry only
2. Or use a file upload (vCard/CSV)
3. Or integrate with OS-specific APIs (Capacitor/Cordova for mobile)

---

## Mobile App Integration (Capacitor)

If you want native contact access on iOS:

```bash
npm install @capacitor/contacts
```

```jsx
import { Contacts } from "@capacitor/contacts";

const handleImportContacts = async () => {
  try {
    const permission = await Contacts.requestPermissions();

    if (permission.contacts === "granted") {
      const result = await Contacts.getContacts({
        projection: {
          name: true,
          phones: true,
        },
      });

      setContacts(result.contacts);
    }
  } catch (err) {
    console.error("Contact access denied:", err);
  }
};
```

---

## Backend (Already Implemented)

Your existing `addMember` controller already handles this perfectly:

```javascript
// POST /api/groups/:id/members
{
  "mobile": "+919876543210",
  "name": "Rahul Kumar"  // Optional
}

// Creates shadow account if user doesn't exist
// Sends SMS invitation in background
// Returns success immediately
```

---

## Testing

### Test Manual Entry

1. Open Add Member modal
2. Select "Manual"
3. Enter: Name="Test User", Mobile="9999999999"
4. Click "Add Member"
5. Check console for ghost user creation

### Test Contacts Import

1. Open modal
2. Click "Contacts"
3. Grant permission
4. Select contacts
5. Click "Add Selected"

---

## Security Considerations

1. **Rate Limiting**: Limit member additions per hour
2. **Validation**: Always validate phone numbers server-side
3. **Privacy**: Don't store full contact lists, only selected
4. **Permissions**: Request contacts permission only when needed
