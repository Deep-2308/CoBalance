/**
 * SMS Service for sending invitations
 * 
 * This is a mock implementation. Replace with real SMS provider like:
 * - Twilio
 * - AWS SNS
 * - MSG91
 * - Gupshup
 */

/**
 * Send group invitation SMS to new member
 * @param {string} mobile - Mobile number with country code
 * @param {string} groupName - Name of the group they were added to
 * @param {string} inviterName - Name of person who added them
 */
export const sendGroupInviteSMS = async (mobile, groupName, inviterName) => {
    try {
        const message = `Hi! ${inviterName} added you to "${groupName}" on CoBalance. Download now and start tracking expenses: https://cobalance.app/join`;

        // TODO: Replace with actual SMS provider
        console.log('📱 SMS INVITATION SENT:');
        console.log(`   To: ${mobile}`);
        console.log(`   Message: ${message}`);
        console.log(`   Group: ${groupName}`);
        console.log(`   Invited by: ${inviterName}`);

        // Mock delay to simulate API call
        await new Promise(resolve => setTimeout(resolve, 100));

        // In production, use real SMS service:
        /*
        // Example with Twilio:
        const twilioClient = require('twilio')(ACCOUNT_SID, AUTH_TOKEN);
        await twilioClient.messages.create({
            body: message,
            from: '+1234567890',
            to: mobile
        });

        // Example with MSG91:
        await fetch('https://api.msg91.com/api/v5/flow/', {
            method: 'POST',
            headers: { 'authkey': MSG91_AUTH_KEY },
            body: JSON.stringify({
                template_id: 'TEMPLATE_ID',
                mobile: mobile,
                message: message
            })
        });
        */

        return { success: true };
    } catch (error) {
        console.error('Failed to send invitation SMS:', error);
        // Don't throw - SMS failure shouldn't block member addition
        return { success: false, error: error.message };
    }
};

/**
 * Send reminder SMS to ghost user about pending balances
 * @param {string} mobile - Mobile number
 * @param {number} amount - Amount they owe
 * @param {string} groupName - Group name
 */
export const sendBalanceReminderSMS = async (mobile, amount, groupName) => {
    try {
        const message = `You owe ₹${amount} in "${groupName}" on CoBalance. Sign up to settle: https://cobalance.app/join`;

        console.log('📱 BALANCE REMINDER SMS:');
        console.log(`   To: ${mobile}`);
        console.log(`   Message: ${message}`);

        return { success: true };
    } catch (error) {
        console.error('Failed to send reminder SMS:', error);
        return { success: false, error: error.message };
    }
};

export default {
    sendGroupInviteSMS,
    sendBalanceReminderSMS
};
