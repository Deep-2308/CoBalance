/**
 * Balance Simplification Service
 * 
 * Implements a greedy algorithm to minimize the number of transactions
 * needed to settle all debts in a group.
 */

export const simplifyBalances = (balances) => {
    // balances: array of { user_id, user_name, balance }
    // balance > 0 means they should receive money
    // balance < 0 means they owe money

    const creditors = balances
        .filter(b => parseFloat(b.balance) > 0.01)
        .map(b => ({ ...b, balance: parseFloat(b.balance) }))
        .sort((a, b) => b.balance - a.balance);

    const debtors = balances
        .filter(b => parseFloat(b.balance) < -0.01)
        .map(b => ({ ...b, balance: Math.abs(parseFloat(b.balance)) }))
        .sort((a, b) => b.balance - a.balance);

    const settlements = [];

    let i = 0; // creditor index
    let j = 0; // debtor index

    while (i < creditors.length && j < debtors.length) {
        const creditor = creditors[i];
        const debtor = debtors[j];

        const settleAmount = Math.min(creditor.balance, debtor.balance);

        settlements.push({
            from_user_id: debtor.user_id,
            from_user_name: debtor.user_name,
            to_user_id: creditor.user_id,
            to_user_name: creditor.user_name,
            amount: settleAmount.toFixed(2)
        });

        creditor.balance -= settleAmount;
        debtor.balance -= settleAmount;

        if (creditor.balance < 0.01) {
            i++;
        }
        if (debtor.balance < 0.01) {
            j++;
        }
    }

    return settlements;
};

export default { simplifyBalances };
