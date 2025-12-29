"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

import { Modal } from "@/components/Modal";
import { TableCard } from "@/components/TableCard";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { useRoleGuard } from "@/lib/guard";

const ROLE_OPTIONS = ["ADMIN", "BIBLIOTHECAIRE", "LECTEUR"] as const;

type AdminUser = {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  date_joined: string;
  role: string;
};

export default function AdminUsersPage() {
  useRoleGuard(["ADMIN"]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "LECTEUR",
    adresse: "",
    telephone: "",
    cotisation: "",
  });

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<AdminUser[]>("/api/admin/users/");
      setUsers(data);
    } catch {
      setError("Impossible de charger la liste des utilisateurs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    try {
      await api.post("/api/admin/users/", {
        username: form.username,
        email: form.email || undefined,
        password: form.password,
        role: form.role,
        adresse: form.adresse || undefined,
        telephone: form.telephone || undefined,
        cotisation: form.cotisation ? Number(form.cotisation) : undefined,
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
      loadUsers();
    } catch {
      setError("Création utilisateur impossible. Vérifiez les champs.");
    }
  };

  return (
    <div className="space-y-6">
      {error ? <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">{error}</div> : null}

      <TableCard
        title="Utilisateurs"
        action={
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm text-white"
          >
            <Plus className="h-4 w-4" />
            Créer utilisateur
          </button>
        }
      >
        {loading ? (
          <p className="text-sm text-slate-500">Chargement des utilisateurs...</p>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-slate-400">
                <th className="py-2">Utilisateur</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>Statut</th>
                <th>Créé</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user.id} className="text-slate-600">
                  <td className="py-3 font-medium text-slate-700">{user.username}</td>
                  <td>{user.email || "-"}</td>
                  <td>{user.role}</td>
                  <td>{user.is_active ? "Actif" : "Inactif"}</td>
                  <td>{formatDate(user.date_joined)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </TableCard>

      <Modal title="Créer un utilisateur" open={open} onClose={() => setOpen(false)}>
        <form className="space-y-4" onSubmit={handleCreate}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm text-slate-600">
              Username
              <input
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                value={form.username}
                onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
                required
              />
            </label>
            <label className="text-sm text-slate-600">
              Email
              <input
                type="email"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              />
            </label>
          </div>
          <label className="text-sm text-slate-600">
            Mot de passe
            <input
              type="password"
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              required
            />
          </label>
          <label className="text-sm text-slate-600">
            Rôle
            <select
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
              value={form.role}
              onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value }))}
            >
              {ROLE_OPTIONS.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm text-slate-600">
              Adresse
              <input
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                value={form.adresse}
                onChange={(event) => setForm((prev) => ({ ...prev, adresse: event.target.value }))}
              />
            </label>
            <label className="text-sm text-slate-600">
              Téléphone
              <input
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                value={form.telephone}
                onChange={(event) => setForm((prev) => ({ ...prev, telephone: event.target.value }))}
              />
            </label>
          </div>
          <label className="text-sm text-slate-600">
            Cotisation (optionnel)
            <input
              type="number"
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
              value={form.cotisation}
              onChange={(event) => setForm((prev) => ({ ...prev, cotisation: event.target.value }))}
            />
          </label>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm"
            >
              Annuler
            </button>
            <button type="submit" className="rounded-xl bg-brand-600 px-4 py-2 text-sm text-white">
              Enregistrer
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
