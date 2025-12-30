"use client";

import { useEffect, useState } from "react";
import { Send } from "lucide-react";
import { api } from "../../../../lib/api";
import { RoleGuard } from "../../../../components/RoleGuard";
import { TableCard } from "../../../../components/TableCard";
import { formatDate } from "../../../../lib/format";

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [adherents, setAdherents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ recipient_id: "", contenu: "" });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [messagesRes, adherentsRes] = await Promise.all([
        api.get("/api/messages/"),
        api.get("/api/adherents/"),
      ]);
      setMessages(messagesRes.data || []);
      setAdherents(adherentsRes.data.results || []);
      if (!form.recipient_id && adherentsRes.data.results?.length) {
        setForm((prev) => ({ ...prev, recipient_id: String(adherentsRes.data.results[0].user_id) }));
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Impossible de charger les messages.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSend = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    try {
      await api.post("/api/messages/", {
        recipient_id: Number(form.recipient_id),
        contenu: form.contenu,
      });
      setForm((prev) => ({ ...prev, contenu: "" }));
      await fetchData();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Envoi impossible.");
    }
  };

  return (
    <RoleGuard allowed={["ADMIN"]}>
      <div className="space-y-6">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          Fonctionnalité en cours d’amélioration. Les prochaines mises à jour la rendront totalement opérationnelle.
        </div>

        <TableCard title="Messages">
          <div className="space-y-4">
            <form className="grid gap-4 md:grid-cols-[1fr_2fr_auto]" onSubmit={handleSend}>
              <select
                value={form.recipient_id}
                onChange={(event) => setForm({ ...form, recipient_id: event.target.value })}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                required
              >
                {adherents.map((adherent) => (
                  <option key={adherent.id} value={adherent.user_id}>
                    {adherent.prenom} {adherent.nom} ({adherent.username})
                  </option>
                ))}
              </select>
              <input
                value={form.contenu}
                onChange={(event) => setForm({ ...form, contenu: event.target.value })}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                placeholder="Votre message..."
                required
              />
              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
              >
                <Send className="h-4 w-4" />
                Envoyer
              </button>
            </form>

            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-slate-400">
                <tr>
                  <th className="py-2">Expéditeur</th>
                  <th className="py-2">Destinataire</th>
                  <th className="py-2">Message</th>
                  <th className="py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((message) => (
                  <tr key={message.id} className="border-t border-slate-100">
                    <td className="py-3 text-slate-700">{message.sender_username}</td>
                    <td className="py-3 text-slate-600">{message.recipient_username || "Staff"}</td>
                    <td className="py-3 text-slate-600">{message.contenu}</td>
                    <td className="py-3 text-slate-500">{formatDate(message.created_at)}</td>
                  </tr>
                ))}
                {!loading && messages.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-sm text-slate-400">
                      Aucun message.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </TableCard>
      </div>
    </RoleGuard>
  );
}
