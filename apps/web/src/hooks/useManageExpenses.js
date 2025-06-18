const useManageExpenses = () => {
  const manageExpense = async (expenseData) => {
    try {
      const response = await fetch('/api/expenses/management', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expenseData),
      });
      return await response.json();
    } catch (error) {
      console.error('Error managing expense:', error);
      throw error;
    }
  };

  return { manageExpense };
};

export default useManageExpenses;
