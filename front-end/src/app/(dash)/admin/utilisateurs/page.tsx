"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { api } from "../../../../lib/api";
import { RoleGuard } from "../../../../components/RoleGuard";
import { TableCard } from "../../../../components/TableCard";
import { Modal } from "../../../../components/Modal";
import type { UserRole } from "../../../../lib/auth";

const roleOptions: UserRole[] = ["ADMIN", "BIBLIOTHECAIRE", "LECTEUR"];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "LECTEUR" as UserRole,
    adresse: "",
    telephone: "",
    cotisation: "",
  });

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/api/admin/users/");
      setUsers(response.data.results || []);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Impossible de charger les utilisateurs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    try {
      await api.post("/api/admin/users/", {
        username: form.username,
        email: form.email || undefined,
        password: form.password,
        role: form.role,
        adresse: form.role === "LECTEUR" ? form.adresse : undefined,
        telephone: form.role === "LECTEUR" ? form.telephone : undefined,
        cotisation: form.role === "LECTEUR" ? form.cotisation || 0 : undefined,
      });
      setOpen(false);
      setForm({
        username: "",
        email: "",
        password: "",
        role: "LECTEUR",
        adresse: "",
        telephone: "",
        cotisation: "",
      });
      await fetchUsers();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Création impossible.");
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

        <TableCard
          title="Gestion des utilisateurs"
          action={
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
            >
              <Plus className="h-4 w-4" />
              Créer utilisateur
            </button>
          }
        >
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-slate-400">
              <tr>
                <th className="py-2">Nom</th>
                <th className="py-2">Email</th>
                <th className="py-2">Rôle</th>
                <th className="py-2">Statut</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-slate-100">
                  <td className="py-3 text-slate-700">{user.username}</td>
                  <td className="py-3 text-slate-600">{user.email || "-"}</td>
                  <td className="py-3 text-slate-600">{user.role}</td>
                  <td className="py-3 text-slate-600">{user.is_active ? "Actif" : "Inactif"}</td>
                </tr>
              ))}
              {!loading && users.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-sm text-slate-400">
                    Aucun utilisateur trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </TableCard>

        <Modal open={open} onClose={() => setOpen(false)} title="Créer un utilisateur">
          <form className="space-y-4" onSubmit={handleCreate}>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-slate-500">Nom d'utilisateur</label>
                <input
                  value={form.username}
                  onChange={(event) => setForm({ ...form, username: event.target.value })}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-slate-500">Mot de passe</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">Rôle</label>
                <select
                  value={form.role}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      role: event.target.value as UserRole,
                    })
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                >
                  {roleOptions.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {form.role === "LECTEUR" && (
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-slate-500">Adresse</label>
                  <input
                    value={form.adresse}
                    onChange={(event) => setForm({ ...form, adresse: event.target.value })}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Téléphone</label>
                  <input
                    value={form.telephone}
                    onChange={(event) => setForm({ ...form, telephone: event.target.value })}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Cotisation</label>
                  <input
                    type="number"
                    value={form.cotisation}
                    onChange={(event) => setForm({ ...form, cotisation: event.target.value })}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Enregistrer
            </button>
          </form>
        </Modal>
      </div>
    </RoleGuard>
  );
}
