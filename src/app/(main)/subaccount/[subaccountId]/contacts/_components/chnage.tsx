import React from 'react';

interface Contact {
    id: string;
    Ticket: number;
}

interface Props {
    contact: Contact;
    setContactStatus: (id: string, isActive: boolean) => Promise<void>;
    formatTotal: (ticket: number) => string;
}

const ChangeStatus: React.FC<Props> = ({ contact, setContactStatus, formatTotal }) => {
    const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const isActive = e.target.value === 'Active';
        try {
            await setContactStatus(contact.id, isActive);
            // Optionally, you can add some state to reflect the change without reloading the page
        } catch (error) {
            console.error('Failed to change contact status', error);
        }
    };

    return (
        <select
            value={formatTotal(contact.Ticket) === '₹0.00' ? 'Inactive' : 'Active'}
            onChange={handleChange}
        >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
        </select>
    );
};

export default ChangeStatus;