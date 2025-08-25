
import React from 'react';
import { ExpenseManager } from '@/components/ExpenseManager';

const Expenses: React.FC = () => {
  return (
    <div className="container mx-auto p-6">
      <ExpenseManager />
    </div>
  );
};

export default Expenses;
