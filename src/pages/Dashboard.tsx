import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LogOut,
  Key,
  Lock,
  Hash,
  Trash2,
  History,
  User,
  RefreshCw,
  Users,
  UserPlus,
  CreditCard,
  MinusCircle,
  Eye,
  EyeOff,
  Trophy,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { canResetApiKey, generateApiKey } from '../lib/security';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import Footer from '../components/Footer';
import UserListModal from '../components/admin/UserList';
import CreateUserModal from '../components/admin/CreateUserModal';
import AddCreditsModal from '../components/admin/AddCreditsModal';
import { useI18n } from '../lib/i18n';

interface Activity {
  id: string;
  action: string;
  details: string;
  created_at: string;
}

interface TopUser {
  username: string;
  credits: number;
}

const Dashboard: React.FC = () => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showChangePin, setShowChangePin] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [showUserList, setShowUserList] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showAddCredits, setShowAddCredits] = useState(false);
  const [showRemoveCredits, setShowRemoveCredits] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [deletePin, setDeletePin] = useState('');
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [pinData, setPinData] = useState({
    currentPin: '',
    newPin: '',
    confirmPin: '',
  });
  const navigate = useNavigate();
  const { language, translations } = useI18n();
  const t = translations[language];

  useEffect(() => {
    loadActivities();
    loadTopUsers();
  }, []);

  const loadActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Error loading activities:', error);
    }
  };

  const loadTopUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('top_users_by_credits')
        .select('*');

      if (error) throw error;
      setTopUsers(data || []);
    } catch (error) {
      console.error('Error loading top users:', error);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString();
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    toast.success(t.logoutSuccess);
    toast.success(t.sessionEnded);
    navigate('/login');
  };

  const handleResetApiKey = async () => {
    try {
      const { data: userData } = await supabase
        .from('users')
        .select('last_api_key_reset')
        .eq('id', user.id)
        .single();

      const { canReset, daysLeft } = canResetApiKey(userData?.last_api_key_reset);

      if (!canReset) {
        toast.error(t.apiKeyResetWait.replace('{days}', daysLeft.toString()));
        return;
      }

      const newApiKey = generateApiKey();
      const { error } = await supabase
        .from('users')
        .update({
          api_key: newApiKey,
          last_api_key_reset: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success(t.apiKeyResetSuccess);
      toast.success(`${t.apiKey}: ${newApiKey}`);
      handleLogout();
    } catch (error) {
      toast.error(t.apiKeyResetFailed);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error(t.passwordsDoNotMatch);
      return;
    }

    try {
      const { data, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .eq('password', passwordData.currentPassword)
        .single();

      if (checkError || !data) {
        toast.error(t.currentPasswordIncorrect);
        return;
      }

      const { error } = await supabase
        .from('users')
        .update({ password: passwordData.newPassword })
        .eq('id', user.id);

      if (error) throw error;

      toast.success(t.passwordChanged);
      setShowChangePassword(false);
    } catch (error) {
      toast.error(t.passwordChangeFailed);
    }
  };

  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pinData.newPin !== pinData.confirmPin) {
      toast.error(t.pinsDoNotMatch);
      return;
    }

    try {
      const { data, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .eq('pin', pinData.currentPin)
        .single();

      if (checkError || !data) {
        toast.error(t.currentPinIncorrect);
        return;
      }

      const { error } = await supabase
        .from('users')
        .update({ pin: pinData.newPin })
        .eq('id', user.id);

      if (error) throw error;

      toast.success(t.pinChanged);
      setShowChangePin(false);
    } catch (error) {
      toast.error(t.pinChangeFailed);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const { data, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .eq('pin', deletePin)
        .single();

      if (checkError || !data) {
        toast.error(t.invalidPin);
        return;
      }

      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', user.id);

      if (error) throw error;

      toast.success(t.accountDeleted);
      handleLogout();
    } catch (error) {
      toast.error(t.deleteFailed);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* User Info Card */}
          <div className="card col-span-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl">{t.userInfo}</h2>
              <button onClick={handleLogout} className="btn btn-danger">
                <LogOut size={18} />
                {t.logout}
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <User className="text-blue-500" />
                <div>
                  <p className="text-sm text-gray-400">{t.username}</p>
                  <p>{user.username}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Key className="text-blue-500" />
                <div className="flex-grow">
                  <p className="text-sm text-gray-400">{t.apiKey}</p>
                  <div className="flex items-center gap-2">
                    <p className="font-mono">
                      {showApiKey ? user.api_key : user.api_key.replace(/./g, '•')}
                    </p>
                    <button
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="p-1 hover:bg-slate-700 rounded"
                      title={showApiKey ? 'Hide API Key' : 'Show API Key'}
                    >
                      {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CreditCard className="text-blue-500" />
                <div>
                  <p className="text-sm text-gray-400">{t.credits}</p>
                  <p>{user.credits}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Actions */}
          {user.is_admin && (
            <div className="card col-span-full">
              <h3 className="text-lg mb-4">{t.administrator}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => setShowUserList(true)}
                  className="btn btn-primary"
                >
                  <Users size={18} />
                  {t.manageUsers}
                </button>
                <button
                  onClick={() => setShowCreateUser(true)}
                  className="btn btn-primary"
                >
                  <UserPlus size={18} />
                  {t.createUser}
                </button>
                <button
                  onClick={() => setShowAddCredits(true)}
                  className="btn btn-primary"
                >
                  <CreditCard size={18} />
                  {t.addCredits}
                </button>
                <button
                  onClick={() => setShowRemoveCredits(true)}
                  className="btn btn-primary"
                >
                  <MinusCircle size={18} />
                  {t.removeCredits}
                </button>
              </div>
            </div>
          )}

          {/* Action Cards */}
          <div className="card">
            <h3 className="text-lg mb-4">{t.security}</h3>
            <div className="space-y-3">
              <button
                onClick={() => setShowChangePassword(true)}
                className="btn btn-primary w-full"
              >
                <Lock size={18} />
                {t.changePassword}
              </button>
              <button
                onClick={() => setShowChangePin(true)}
                className="btn btn-primary w-full"
              >
                <Hash size={18} />
                {t.changePin}
              </button>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg mb-4">{t.apiManagement}</h3>
            <div className="space-y-3">
              <button
                onClick={handleResetApiKey}
                className="btn btn-primary w-full"
              >
                <RefreshCw size={18} />
                {t.resetApiKey}
              </button>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg mb-4">{t.account}</h3>
            <div className="space-y-3">
              <button
                onClick={() => setShowDeleteAccount(true)}
                className="btn btn-danger w-full"
              >
                <Trash2 size={18} />
                {t.deleteAccount}
              </button>
            </div>
          </div>

          {/* Top Users Card */}
          <div className="card col-span-full lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="text-yellow-500" />
              <h3 className="text-lg">Top Users</h3>
            </div>
            <div className="space-y-2">
              {topUsers.length > 0 ? (
                <div className="divide-y divide-slate-700">
                  {topUsers.map((topUser, index) => (
                    <div key={topUser.username} className="py-2 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${
                          index === 0 ? 'text-yellow-500' :
                          index === 1 ? 'text-slate-400' :
                          index === 2 ? 'text-amber-700' :
                          'text-slate-500'
                        }`}>
                          #{index + 1}
                        </span>
                        <span>{topUser.username}</span>
                      </div>
                      <span className="font-mono text-blue-500">{topUser.credits}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No users found</p>
              )}
            </div>
          </div>

          {/* Recent Activity Card */}
          <div className="card col-span-full lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <History className="text-blue-500" />
              <h3 className="text-lg">{t.recentActivity}</h3>
            </div>
            <div className="space-y-2">
              {activities.length > 0 ? (
                <div className="divide-y divide-slate-700">
                  {activities.map((activity) => (
                    <div key={activity.id} className="py-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{activity.action}</p>
                          {activity.details && (
                            <p className="text-sm text-gray-400">{activity.details}</p>
                          )}
                        </div>
                        <span className="text-sm text-gray-400">
                          {new Date(activity.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">{t.noRecentActivity}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <Modal
        show={showChangePassword}
        onClose={() => setShowChangePassword(false)}
        title={t.changePassword}
      >
        <form onSubmit={handleChangePassword} className="space-y-4">
          <input
            type="password"
            placeholder={t.currentPassword}
            className="input w-full"
            value={passwordData.currentPassword}
            onChange={(e) =>
              setPasswordData({ ...passwordData, currentPassword: e.target.value })
            }
            required
          />
          <input
            type="password"
            placeholder={t.newPassword}
            className="input w-full"
            value={passwordData.newPassword}
            onChange={(e) =>
              setPasswordData({ ...passwordData, newPassword: e.target.value })
            }
            required
          />
          <input
            type="password"
            placeholder={t.confirmPassword}
            className="input w-full"
            value={passwordData.confirmPassword}
            onChange={(e) =>
              setPasswordData({ ...passwordData, confirmPassword: e.target.value })
            }
            required
          />
          <button type="submit" className="btn btn-primary w-full">
            <Lock size={18} />
            {t.changePassword}
          </button>
        </form>
      </Modal>

      <Modal
        show={showChangePin}
        onClose={() => setShowChangePin(false)}
        title={t.changePin}
      >
        <form onSubmit={handleChangePin} className="space-y-4">
          <input
            type="text"
            placeholder={t.currentPin}
            className="input w-full"
            maxLength={6}
            pattern="\d{6}"
            value={pinData.currentPin}
            onChange={(e) =>
              setPinData({ ...pinData, currentPin: e.target.value.replace(/\D/g, '') })
            }
            required
          />
          <input
            type="text"
            placeholder={t.newPin}
            className="input w-full"
            maxLength={6}
            pattern="\d{6}"
            value={pinData.newPin}
            onChange={(e) =>
              setPinData({ ...pinData, newPin: e.target.value.replace(/\D/g, '') })
            }
            required
          />
          <input
            type="text"
            placeholder={t.confirmPin}
            className="input w-full"
            maxLength={6}
            pattern="\d{6}"
            value={pinData.confirmPin}
            onChange={(e) =>
              setPinData({ ...pinData, confirmPin: e.target.value.replace(/\D/g, '') })
            }
            required
          />
          <button type="submit" className="btn btn-primary w-full">
            <Hash size={18} />
            {t.changePin}
          </button>
        </form>
      </Modal>

      <Modal
        show={showDeleteAccount}
        onClose={() => setShowDeleteAccount(false)}
        title={t.confirmDelete}
      >
        <div className="space-y-4">
          <p className="text-red-500">
            {t.deleteConfirmation}
          </p>
          <input
            type="text"
            placeholder={t.enterPinConfirm}
            className="input w-full"
            maxLength={6}
            pattern="\d{6}"
            value={deletePin}
            onChange={(e) => setDeletePin(e.target.value.replace(/\D/g, ''))}
            required
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowDeleteAccount(false)}
              className="btn btn-primary"
            >
              {t.cancel}
            </button>
            <button
              onClick={handleDeleteAccount}
              className="btn btn-danger"
            >
              <Trash2 size={18} />
              {t.delete}
            </button>
          </div>
        </div>
      </Modal>

      {/* Admin Modals */}
      <UserListModal
        show={showUserList}
        onClose={() => setShowUserList(false)}
      />

      <CreateUserModal
        show={showCreateUser}
        onClose={() => setShowCreateUser(false)}
      />

      <AddCreditsModal
        show={showAddCredits}
        onClose={() => setShowAddCredits(false)}
        action="add"
      />

      <AddCreditsModal
        show={showRemoveCredits}
        onClose={() => setShowRemoveCredits(false)}
        action="remove"
      />

      <Footer />
    </div>
  );
};

export default Dashboard;