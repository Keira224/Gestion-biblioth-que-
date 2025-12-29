export const formatDate = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("fr-FR");
};

export const formatMoney = (value?: string | number | null) => {
  if (value === null || value === undefined) return "-";
  const amount = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(amount)) return String(value);
  return amount.toLocaleString("fr-FR", { style: "currency", currency: "XOF" });
};
