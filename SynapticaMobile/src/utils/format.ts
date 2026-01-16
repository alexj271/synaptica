export const formatNumber = (num: number, decimals: number = 2): string => {
  return num.toFixed(decimals);
};

export const formatCurrency = (amount: number): string => {
  return `$${amount.toFixed(2)}`;
};
