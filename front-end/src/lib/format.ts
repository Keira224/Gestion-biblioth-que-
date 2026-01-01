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

const pickErrorMessage = (data: any): string | null => {
  if (!data) return null;
  if (typeof data === "string") return data;
  if (typeof data.detail === "string" && data.detail.trim()) return data.detail;
  if (Array.isArray(data)) {
    const first = data.find((item) => typeof item === "string" && item.trim());
    return first ?? null;
  }
  if (typeof data === "object") {
    for (const value of Object.values(data)) {
      if (typeof value === "string" && value.trim()) return value;
      if (Array.isArray(value)) {
        const first = value.find((item) => typeof item === "string" && item.trim());
        if (first) return first;
      }
    }
  }
  return null;
};

export const formatApiError = (error: unknown, fallback: string) => {
  const data = (error as any)?.response?.data;
  const fromResponse = pickErrorMessage(data);
  if (fromResponse) return fromResponse;
  const message = (error as any)?.message;
  if (typeof message === "string" && message.trim()) return message;
  return fallback;
};
