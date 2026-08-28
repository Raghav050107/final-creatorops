import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import type { Manager } from '../types/creatorops';
import { 
  User, 
  Mail, 
  Lock, 
  Check, 
  X, 
  ShieldCheck, 
  Building2,
  KeyRound,
  Users,
  Edit2,
  Plus,
  Trash2
} from 'lucide-react';

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  managers?: Manager[];
  onRefreshWorkspace?: () => void;
}

export const AccountSettingsModal: React.FC<AccountSettingsModalProps> = ({ 
  isOpen, 
  onClose,
  managers = [],
  onRefreshWorkspace
}) => {
  const { user, agency, updateProfile, changePassword } = useAuth();

  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'team'>('profile');

  // Profile Form
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Password Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Agency & Team Form
  const [agencyName, setAgencyName] = useState(agency?.name || 'Unseen Hours');
  const [editingManager, setEditingManager] = useState<Manager | null>(null);
  const [editManagerName, setEditManagerName] = useState('');
  const [editManagerEmail, setEditManagerEmail] = useState('');
  const [editManagerRole, setEditManagerRole] = useState('manager');

  // Add New Manager Form
  const [isAddingManager, setIsAddingManager] = useState(false);
  const [newMgrName, setNewMgrName] = useState('');
  const [newMgrEmail, setNewMgrEmail] = useState('');
  const [newMgrPassword, setNewMgrPassword] = useState('');
  const [newMgrRole, setNewMgrRole] = useState('manager');

  const [teamSuccess, setTeamSuccess] = useState<string | null>(null);
  const [teamError, setTeamError] = useState<string | null>(null);
  const [teamLoading, setTeamLoading] = useState(false);

  if (!isOpen) return null;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(false);
    setProfileLoading(true);

    try {
      await updateProfile({ name, email });
      setProfileSuccess(true);
      if (onRefreshWorkspace) onRefreshWorkspace();
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err: any) {
      setProfileError(err.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match');
      return;
    }

    setPasswordLoading(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleUpdateAgencyName = async (e: React.FormEvent) => {
    e.preventDefault();
    setTeamError(null);
    setTeamSuccess(null);
    setTeamLoading(true);
    try {
      await api.updateAgency({ name: agencyName });
      setTeamSuccess('Agency name updated successfully!');
      if (onRefreshWorkspace) onRefreshWorkspace();
      setTimeout(() => setTeamSuccess(null), 3000);
    } catch (err: any) {
      setTeamError(err.message || 'Failed to update agency name');
    } finally {
      setTeamLoading(false);
    }
  };

  const handleSaveEditManager = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingManager) return;
    setTeamError(null);
    setTeamSuccess(null);
    setTeamLoading(true);
    try {
      await api.updateManager(editingManager.id, {
        name: editManagerName,
        email: editManagerEmail,
        role: editManagerRole
      });
      setTeamSuccess(`Manager ${editManagerName} updated!`);
      setEditingManager(null);
      if (onRefreshWorkspace) onRefreshWorkspace();
      setTimeout(() => setTeamSuccess(null), 3000);
    } catch (err: any) {
      setTeamError(err.message || 'Failed to update manager');
    } finally {
      setTeamLoading(false);
    }
  };

  const handleAddNewManager = async (e: React.FormEvent) => {
    e.preventDefault();
    setTeamError(null);
    setTeamSuccess(null);
    setTeamLoading(true);
    try {
      await api.addManager({
        name: newMgrName,
        email: newMgrEmail,
        password: newMgrPassword,
        role: newMgrRole
      });
      setTeamSuccess(`New manager ${newMgrName} added successfully!`);
      setIsAddingManager(false);
      setNewMgrName('');
      setNewMgrEmail('');
      setNewMgrPassword('');
      if (onRefreshWorkspace) onRefreshWorkspace();
      setTimeout(() => setTeamSuccess(null), 3000);
    } catch (err: any) {
      setTeamError(err.message || 'Failed to add manager');
    } finally {
      setTeamLoading(false);
    }
  };

  const handleDeleteManager = async (managerId: string, managerName: string) => {
    if (!window.confirm(`Are you sure you want to remove ${managerName}?`)) return;
    setTeamError(null);
    setTeamSuccess(null);
    setTeamLoading(true);
    try {
      await api.deleteManager(managerId);
      setTeamSuccess(`Manager ${managerName} removed.`);
      if (onRefreshWorkspace) onRefreshWorkspace();
      setTimeout(() => setTeamSuccess(null), 3000);
    } catch (err: any) {
      setTeamError(err.message || 'Failed to delete manager');
    } finally {
      setTeamLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface rounded-2xl max-w-lg w-full shadow-2xl border border-border overflow-hidden animate-in fade-in zoom-in duration-150">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-border bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-accent text-white rounded-xl shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">
                Account & Workspace Settings
              </h3>
              <p className="text-[11px] text-slate-300">
                Manage credentials, passwords & manager seats
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-3 p-1.5 bg-bg border-b border-border">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'profile' ? 'bg-surface text-ink shadow-subtle' : 'text-ink-muted hover:text-ink'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>My Profile</span>
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'password' ? 'bg-surface text-ink shadow-subtle' : 'text-ink-muted hover:text-ink'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Password</span>
          </button>
          <button
            onClick={() => setActiveTab('team')}
            className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'team' ? 'bg-surface text-ink shadow-subtle' : 'text-ink-muted hover:text-ink'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Managers & Agency</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* TAB 1: PROFILE & EMAIL */}
          {activeTab === 'profile' && (
            <form onSubmit={handleUpdateProfile} className="space-y-3.5">
              {profileError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
                  {profileError}
                </div>
              )}
              {profileSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-bold flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Profile credentials updated successfully!</span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-ink uppercase mb-1">
                  Your Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-bg text-ink text-xs rounded-lg border border-border focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-ink uppercase mb-1">
                  Email Address (Login Username)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-bg text-ink text-xs rounded-lg border border-border focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 text-xs font-bold text-ink-muted hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-xs font-bold rounded-lg shadow-subtle flex items-center gap-1.5 transition-all"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{profileLoading ? 'Saving...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: CHANGE PASSWORD */}
          {activeTab === 'password' && (
            <form onSubmit={handleChangePassword} className="space-y-3.5">
              {passwordError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
                  {passwordError}
                </div>
              )}
              {passwordSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-bold flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Password changed successfully!</span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-ink uppercase mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-bg text-ink text-xs rounded-lg border border-border focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-ink uppercase mb-1">
                  New Password
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-bg text-ink text-xs rounded-lg border border-border focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-ink uppercase mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-bg text-ink text-xs rounded-lg border border-border focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 text-xs font-bold text-ink-muted hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-xs font-bold rounded-lg shadow-subtle flex items-center gap-1.5 transition-all"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{passwordLoading ? 'Updating...' : 'Update Password'}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: MANAGERS & AGENCY NAME */}
          {activeTab === 'team' && (
            <div className="space-y-4">
              {teamError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
                  {teamError}
                </div>
              )}
              {teamSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-bold flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>{teamSuccess}</span>
                </div>
              )}

              {/* Agency Name Update Section */}
              <form onSubmit={handleUpdateAgencyName} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <label className="block text-[11px] font-bold text-ink uppercase">
                  Agency Workspace Name
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={agencyName}
                      onChange={(e) => setAgencyName(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 bg-white text-ink text-xs rounded-lg border border-border focus:outline-none focus:border-accent"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={teamLoading}
                    className="px-3 py-1.5 bg-accent text-white text-xs font-bold rounded-lg hover:bg-accent-hover transition-colors"
                  >
                    Save Name
                  </button>
                </div>
              </form>

              {/* Team Manager List & Editing */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-ink uppercase tracking-wider">
                    Team Managers ({managers.length})
                  </p>
                  <button
                    onClick={() => {
                      setIsAddingManager(true);
                      setEditingManager(null);
                    }}
                    className="flex items-center gap-1 text-xs font-bold text-accent hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Manager</span>
                  </button>
                </div>

                {/* ADD NEW MANAGER FORM */}
                {isAddingManager && (
                  <form onSubmit={handleAddNewManager} className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-xl space-y-2.5">
                    <p className="text-xs font-bold text-slate-900">Add New Manager Seat</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <input
                        type="text"
                        required
                        placeholder="Manager Name"
                        value={newMgrName}
                        onChange={(e) => setNewMgrName(e.target.value)}
                        className="px-2.5 py-1.5 bg-white border border-border rounded-lg"
                      />
                      <input
                        type="email"
                        required
                        placeholder="Work Email"
                        value={newMgrEmail}
                        onChange={(e) => setNewMgrEmail(e.target.value)}
                        className="px-2.5 py-1.5 bg-white border border-border rounded-lg"
                      />
                      <input
                        type="password"
                        required
                        placeholder="Initial Password"
                        value={newMgrPassword}
                        onChange={(e) => setNewMgrPassword(e.target.value)}
                        className="px-2.5 py-1.5 bg-white border border-border rounded-lg"
                      />
                      <select
                        value={newMgrRole}
                        onChange={(e) => setNewMgrRole(e.target.value)}
                        className="px-2.5 py-1.5 bg-white border border-border rounded-lg font-bold"
                      >
                        <option value="manager font-bold">Operations Manager</option>
                        <option value="owner">Agency Principal / Owner</option>
                        <option value="viewer">Read-Only Viewer</option>
                      </select>
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsAddingManager(false)}
                        className="px-3 py-1 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={teamLoading}
                        className="px-3.5 py-1 bg-accent text-white text-xs font-bold rounded"
                      >
                        Add Manager
                      </button>
                    </div>
                  </form>
                )}

                {/* EDITING SPECIFIC MANAGER FORM */}
                {editingManager && (
                  <form onSubmit={handleSaveEditManager} className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-2.5">
                    <p className="text-xs font-bold text-amber-900">Editing Manager: {editingManager.name}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <input
                        type="text"
                        required
                        value={editManagerName}
                        onChange={(e) => setEditManagerName(e.target.value)}
                        className="px-2.5 py-1.5 bg-white border border-border rounded-lg"
                      />
                      <input
                        type="email"
                        required
                        value={editManagerEmail}
                        onChange={(e) => setEditManagerEmail(e.target.value)}
                        className="px-2.5 py-1.5 bg-white border border-border rounded-lg"
                      />
                      <select
                        value={editManagerRole}
                        onChange={(e) => setEditManagerRole(e.target.value)}
                        className="col-span-2 px-2.5 py-1.5 bg-white border border-border rounded-lg font-bold"
                      >
                        <option value="manager">Operations Manager</option>
                        <option value="owner">Agency Principal / Owner</option>
                        <option value="viewer">Read-Only Viewer</option>
                      </select>
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setEditingManager(null)}
                        className="px-3 py-1 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={teamLoading}
                        className="px-3.5 py-1 bg-accent text-white text-xs font-bold rounded"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                )}

                {/* LIST OF MANAGERS */}
                <div className="divide-y divide-border border border-border rounded-xl bg-white overflow-hidden text-xs">
                  {managers.map(m => (
                    <div key={m.id} className="p-3 flex items-center justify-between hover:bg-slate-50">
                      <div className="flex items-center gap-2.5">
                        <img src={m.avatarUrl} alt={m.name} className="w-8 h-8 rounded-full border border-border object-cover" />
                        <div>
                          <p className="font-bold text-ink">{m.name}</p>
                          <p className="text-[10px] text-slate-500">{m.email} • <span className="font-bold text-accent">{m.role}</span></p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setEditingManager(m);
                            setEditManagerName(m.name);
                            setEditManagerEmail(m.email);
                            setEditManagerRole(m.role.includes('Owner') ? 'owner' : 'manager');
                            setIsAddingManager(false);
                          }}
                          className="p-1.5 text-slate-500 hover:text-accent hover:bg-slate-100 rounded-md"
                          title="Edit manager details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {user?.id !== m.id && (
                          <button
                            onClick={() => handleDeleteManager(m.id, m.name)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                            title="Delete manager seat"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
