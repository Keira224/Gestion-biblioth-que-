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
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "LECTEUR" as UserRole,
    adresse: "",
    telephone: "",
    cotisation: "",
  });
  const [editForm, setEditForm] = useState({
    username: "",
    email: "",
    role: "LECTEUR" as UserRole,
    is_active: true,
    adresse: "",
    telephone: "",
    cotisation: "",
  });

  const fetchUsers = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/api/admin/users/", {
        params: {
          page,
          search: search || undefined,
          role: roleFilter || undefined,
        },
      });
      setUsers(response.data.results || []);
      setPagination(response.data.pagination || { page: 1, pages: 1 });
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Impossible de charger les utilisateurs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, roleFilter]);

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

  const openEditModal = (user: any) => {
    setSelectedUserId(user.id);
    setEditForm({
      username: user.username || "",
      email: user.email || "",
      role: user.role as UserRole,
      is_active: user.is_active,
      adresse: user.adherent?.adresse || "",
      telephone: user.adherent?.telephone || "",
      cotisation: user.adherent?.cotisation || "",
    });
    setEditOpen(true);
  };

  const handleUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedUserId) return;
    setError(null);
    try {
      await api.patch(`/api/admin/users/${selectedUserId}/`, {
        username: editForm.username,
        email: editForm.email || undefined,
        role: editForm.role,
        is_active: editForm.is_active,
        adresse: editForm.role === "LECTEUR" ? editForm.adresse : undefined,
        telephone: editForm.role === "LECTEUR" ? editForm.telephone : undefined,
        cotisation: editForm.role === "LECTEUR" ? editForm.cotisation || 0 : undefined,
      });
      setEditOpen(false);
      await fetchUsers(pagination.page);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Modification impossible.");
    }
  };

  const handleDeactivate = async (userId: number) => {
    setError(null);
    try {
      await api.delete(`/api/admin/users/${userId}/`);
      await fetchUsers(pagination.page);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Désactivation impossible.");
    }
  };

  const handleDelete = async (userId: number) => {
    if (!confirm("Supprimer définitivement cet utilisateur ?")) return;
    setError(null);
    try {
      await api.delete(`/api/admin/users/${userId}/delete/`);
      await fetchUsers(pagination.page);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Suppression impossible.");
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
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full max-w-xs rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="Rechercher..."
            />
            <select
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">Tous les rôles</option>
              {roleOptions.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-slate-400">
              <tr>
                <th className="py-2">Nom</th>
                <th className="py-2">Email</th>
                <th className="py-2">Rôle</th>
                <th className="py-2">Statut</th>
                <th className="py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-slate-100">
                  <td className="py-3 text-slate-700">{user.username}</td>
                  <td className="py-3 text-slate-600">{user.email || "-"}</td>
                  <td className="py-3 text-slate-600">{user.role}</td>
                  <td className="py-3 text-slate-600">{user.is_active ? "Actif" : "Inactif"}</td>
                  <td className="py-3 text-right space-x-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(user)}
                      className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600"
                    >
                      Modifier
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeactivate(user.id)}
                      className="rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white"
                    >
                      Désactiver
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(user.id)}
                      className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-600"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && users.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-sm text-slate-400">
                    Aucun utilisateur trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
            <span>
              Page {pagination.page} / {pagination.pages}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fetchUsers(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="rounded-lg border border-slate-200 px-3 py-1 disabled:opacity-50"
              >
                Précédent
              </button>
              <button
                type="button"
                onClick={() => fetchUsers(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
                className="rounded-lg border border-slate-200 px-3 py-1 disabled:opacity-50"
              >
                Suivant
              </button>
            </div>
          </div>
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

        <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Modifier un utilisateur">
          <form className="space-y-4" onSubmit={handleUpdate}>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-slate-500">Nom d'utilisateur</label>
                <input
                  value={editForm.username}
                  onChange={(event) => setEditForm({ ...editForm, username: event.target.value })}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(event) => setEditForm({ ...editForm, email: event.target.value })}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-slate-500">Rôle</label>
                <select
                  value={editForm.role}
                  onChange={(event) =>
                    setEditForm({
                      ...editForm,
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
              <div>
                <label className="text-xs font-semibold text-slate-500">Statut</label>
                <select
                  value={editForm.is_active ? "actif" : "inactif"}
                  onChange={(event) =>
                    setEditForm({
                      ...editForm,
                      is_active: event.target.value === "actif",
                    })
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="actif">Actif</option>
                  <option value="inactif">Inactif</option>
                </select>
              </div>
            </div>

            {editForm.role === "LECTEUR" && (
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-slate-500">Adresse</label>
                  <input
                    value={editForm.adresse}
                    onChange={(event) => setEditForm({ ...editForm, adresse: event.target.value })}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Téléphone</label>
                  <input
                    value={editForm.telephone}
                    onChange={(event) => setEditForm({ ...editForm, telephone: event.target.value })}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Cotisation</label>
                  <input
                    type="number"
                    value={editForm.cotisation}
                    onChange={(event) => setEditForm({ ...editForm, cotisation: event.target.value })}
                    className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Mettre à jour
            </button>
          </form>
        </Modal>
      </div>
    </RoleGuard>
  );
}
