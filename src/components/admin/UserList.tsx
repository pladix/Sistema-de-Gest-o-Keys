import React, { useState, useEffect } from 'react';
import { Search, Edit2, Ban, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Modal from '../Modal';
import toast from 'react-hot-toast';
import { useI18n } from '../../lib/i18n';

interface User {
  id: string;
  username: string;
  telegram_id: string;
  api_key: string;
  credits: number;
  is_admin: boolean;
  banned: boolean;
}

interface UserListModalProps {
  show: boolean;
  onClose: () => void;
}

export default function UserListModal({ show, onClose }: UserListModalProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { language, translations } = useI18n();
  const t = translations[language];

  useEffect(() => {
    if (show) {
      loadUsers();
    }
  }, [show]);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      toast.error('Error loading users');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (user: User) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          credits: user.credits,
          is_admin: user.is_admin
        })
        .eq('id', user.id);

      if (error) throw error;
      
      toast.success('User updated successfully');
      setShowEditModal(false);
      loadUsers();
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  const handleBanUser = async (user: User) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ banned: !user.banned })
        .eq('id', user.id);

      if (error) throw error;
      
      toast.success(user.banned ? t.userUnbanned : t.userBanned);
      loadUsers();
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const handleDeleteUser = async (user: User) => {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', user.id);

      if (error) throw error;
      
      toast.success(t.userDeleted);
      setShowDeleteModal(false);
      loadUsers();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.telegram_id.includes(searchTerm) ||
    user.api_key.includes(searchTerm)
  );

  return (
    <Modal show={show} onClose={onClose} title={t.manageUsers}>
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input
            type="text"
            placeholder={t.searchUsers}
            className="input w-full pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left">
                <th className="p-2">{t.username}</th>
                <th className="p-2">{t.credits}</th>
                <th className="p-2">{t.administrator}</th>
                <th className="p-2">{t.status}</th>
                <th className="p-2">{t.actions}</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id} className="border-t border-slate-700">
                  <td className="p-2">{user.username}</td>
                  <td className="p-2">{user.credits}</td>
                  <td className="p-2">{user.is_admin ? '✓' : '✗'}</td>
                  <td className="p-2">
                    <span className={user.banned ? 'text-red-500' : 'text-green-500'}>
                      {user.banned ? t.banned : t.active}
                    </span>
                  </td>
                  <td className="p-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowEditModal(true);
                        }}
                        className="p-1 hover:bg-slate-700 rounded"
                        title={t.edit}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleBanUser(user)}
                        className="p-1 hover:bg-slate-700 rounded"
                        title={user.banned ? t.unban : t.ban}
                      >
                        <Ban size={16} className={user.banned ? 'text-red-500' : ''} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowDeleteModal(true);
                        }}
                        className="p-1 hover:bg-slate-700 rounded text-red-500"
                        title={t.delete}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit User Modal */}
      <Modal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={t.edit}
      >
        {selectedUser && (
          <form onSubmit={(e) => {
            e.preventDefault();
            handleUpdateUser(selectedUser);
          }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t.username}</label>
              <input
                type="text"
                className="input w-full"
                value={selectedUser.username}
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t.credits}</label>
              <input
                type="number"
                className="input w-full"
                value={selectedUser.credits}
                onChange={(e) => setSelectedUser({
                  ...selectedUser,
                  credits: parseInt(e.target.value) || 0
                })}
                min="0"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isAdmin"
                checked={selectedUser.is_admin}
                onChange={(e) => setSelectedUser({
                  ...selectedUser,
                  is_admin: e.target.checked
                })}
              />
              <label htmlFor="isAdmin">{t.administrator}</label>
            </div>
            <button type="submit" className="btn btn-primary w-full">
              {t.save}
            </button>
          </form>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title={t.confirmDelete}
      >
        {selectedUser && (
          <div className="space-y-4">
            <p className="text-red-500">
              {t.deleteConfirmation}
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn btn-primary"
              >
                {t.cancel}
              </button>
              <button
                onClick={() => handleDeleteUser(selectedUser)}
                className="btn btn-danger"
              >
                {t.delete}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </Modal>
  );
}