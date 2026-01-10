export const generateReminder = async (req, res) => {
    try {
        const { name, mobile, amount } = req.body;

        if (!name || !mobile || !amount) {
            return res.status(400).json({ error: 'Name, mobile, and amount required' });
        }

        const message = encodeURIComponent(
            `Hi ${name}, this is a friendly reminder about the pending balance of ₹${amount}. Please settle when convenient. - CoBalance`
        );

        const whatsappLink = `https://wa.me/${mobile.replace(/[^0-9]/g, '')}?text=${message}`;

        res.json({ success: true, whatsappLink, message });
    } catch (error) {
        console.error('Generate reminder error:', error);
        res.status(500).json({ error: 'Failed to generate reminder' });
    }
};
