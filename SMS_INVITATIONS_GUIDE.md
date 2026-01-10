# SMS Invitations for Shadow Users

## Overview

When a ghost/shadow user is added to a group, the system automatically sends them an SMS invitation to download CoBalance and join the group.

## SMS Service

**File:** `backend/src/services/sms.service.js`

### Mock Implementation

Currently uses console logging. In production, replace with:

- **Twilio** (International)
- **MSG91** (India)
- **AWS SNS** (Global)
- **Gupshup** (India)

### SMS Message Template

```
Hi! {INVITER_NAME} added you to "{GROUP_NAME}" on CoBalance.
Download now and start tracking expenses: https://cobalance.app/join
```

### Example SMS

```
Hi! Ravi Kumar added you to "Goa Trip 2024" on CoBalance.
Download now and start tracking expenses: https://cobalance.app/join
```

## Implementation

### 1. Non-Blocking SMS

SMS is sent **after** the member is added to the database:

```javascript
// Add member to group first
const member = await addMemberToGroup(userId, groupId);

// Send SMS in background (fire and forget)
sendGroupInviteSMS(mobile, groupName, inviterName).catch((err) =>
  console.error("SMS failed")
);

// Return success immediately
return res.json({ success: true, member });
```

**Why?** SMS failures shouldn't block member addition.

### 2. API Response

```json
{
  "success": true,
  "member": {
    "id": "uuid-123",
    "name": "Friend 3210",
    "mobile": "+919876543210"
  },
  "is_ghost_user": true,
  "sms_sent": true,
  "message": "Friend added! We'll send them an invite to join CoBalance."
}
```

## Integration with Real SMS Providers

### Option 1: Twilio (International)

```javascript
import twilio from "twilio";

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

export const sendGroupInviteSMS = async (mobile, groupName, inviterName) => {
  const message = `Hi! ${inviterName} added you to "${groupName}" on CoBalance. Download: https://cobalance.app/join`;

  await client.messages.create({
    body: message,
    from: "+1234567890", // Your Twilio number
    to: mobile,
  });
};
```

**Setup:**

```bash
npm install twilio
```

**Environment:**

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1234567890
```

### Option 2: MSG91 (India - Cheaper)

```javascript
export const sendGroupInviteSMS = async (mobile, groupName, inviterName) => {
  const response = await fetch("https://api.msg91.com/api/v5/flow/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authkey: process.env.MSG91_AUTH_KEY,
    },
    body: JSON.stringify({
      template_id: process.env.MSG91_TEMPLATE_ID,
      short_url: "0",
      recipients: [
        {
          mobiles: mobile,
          VAR1: inviterName,
          VAR2: groupName,
          VAR3: "https://cobalance.app/join",
        },
      ],
    }),
  });

  return await response.json();
};
```

**Setup:**

```bash
# No npm install needed - uses fetch
```

**Environment:**

```env
MSG91_AUTH_KEY=xxxxxxxxxxxxxxxx
MSG91_TEMPLATE_ID=xxxxxxxxxxxxxxxx
```

### Option 3: AWS SNS (Global)

```javascript
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const snsClient = new SNSClient({ region: process.env.AWS_REGION });

export const sendGroupInviteSMS = async (mobile, groupName, inviterName) => {
  const message = `Hi! ${inviterName} added you to "${groupName}" on CoBalance. Download: https://cobalance.app/join`;

  const command = new PublishCommand({
    PhoneNumber: mobile,
    Message: message,
  });

  await snsClient.send(command);
};
```

**Setup:**

```bash
npm install @aws-sdk/client-sns
```

**Environment:**

```env
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=xxxxxxxxxxxxx
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxx
```

## Cost Comparison (India)

| Provider | Cost per SMS | Best For         |
| -------- | ------------ | ---------------- |
| MSG91    | ₹0.15-0.20   | India only       |
| Twilio   | ₹0.50-0.80   | International    |
| AWS SNS  | ₹0.60-0.90   | AWS ecosystem    |
| Gupshup  | ₹0.15-0.25   | India + WhatsApp |

## Rate Limiting

Prevent SMS spam:

```javascript
// Add rate limiting
import rateLimit from "express-rate-limit";

const smsLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Max 10 invites per hour per user
  message: "Too many invitations. Please try again later.",
});

router.post("/:id/members", smsLimiter, addMember);
```

## Optional Name Parameter

Users can now provide a custom name for ghost users:

```javascript
// Frontend
await api.post(`/groups/${groupId}/members`, {
  mobile: "9876543210",
  name: "Rahul", // Optional - overrides "Friend XXXX"
});
```

**Result:**

- **Without name:** "Friend 3210" (auto-generated)
- **With name:** "Rahul" (user-provided)

## Testing

### 1. Test with Console Logs

Current implementation logs to console:

```
📱 SMS INVITATION SENT:
   To: +919876543210
   Message: Hi! Ravi added you to "Goa Trip"...
   Group: Goa Trip
   Invited by: Ravi
```

### 2. Test with Real Provider

```javascript
// In .env
SMS_PROVIDER=mock  # or 'twilio', 'msg91', 'aws'

// In sms.service.js
if (process.env.SMS_PROVIDER === 'mock') {
    console.log('Mock SMS sent');
} else {
    await actualSmsProvider.send();
}
```

## Future Enhancements

### 1. SMS Templates

```javascript
const templates = {
  GROUP_INVITE: "Hi {name}! {inviter} added you to {group}...",
  BALANCE_REMINDER: "You owe ₹{amount} in {group}...",
  SETTLEMENT_REQUEST: "{inviter} requested ₹{amount}...",
};
```

### 2. Track SMS Status

```javascript
// Add to database
await supabase.from("sms_log").insert({
  user_id: targetUserId,
  mobile: mobile,
  type: "GROUP_INVITE",
  status: "sent",
  sent_at: new Date(),
});
```

### 3. WhatsApp Fallback

```javascript
// Try SMS first, fallback to WhatsApp
try {
  await sendSMS(mobile, message);
} catch (err) {
  await sendWhatsApp(mobile, message);
}
```

---

**Your ghost users will now receive automatic invitations!** 📱
