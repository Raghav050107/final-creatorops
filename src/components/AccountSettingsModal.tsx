import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { resetWorkspaceData } from '../lib/store';
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
  Trash2,
  AlertTriangle
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
  const { user, agency, updateProfile, changePassword, logout } = useAuth();

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
      setPasswordError('New passwords do not match');
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
      setTeamSuccess('Agency name updated successfully');
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
      setEditingManager(null);
      setTeamSuccess('Manager updated successfully');
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
      setIsAddingManager(false);
      setNewMgrName('');
      setNewMgrEmail('');
      setNewMgrPassword('');
      setTeamSuccess('New manager seat created!');
      if (onRefreshWorkspace) onRefreshWorkspace();
      setTimeout(() => setTeamSuccess(null), 3000);
    } catch (err: any) {
      setTeamError(err.message || 'Failed to create manager seat');
    } finally {
      setTeamLoading(false);
    }
  };

  const handleDeleteManager = async (managerId: string, managerName: string) => {
    if (!confirm(`Remove manager ${managerName} from agency?`)) return;
    setTeamError(null);
    setTeamSuccess(null);

    try {
      await api.deleteManager(managerId);
      setTeamSuccess(`Manager ${managerName} removed.`);
      if (onRefreshWorkspace) onRefreshWorkspace();
      setTimeout(() => setTeamSuccess(null), 3000);
    } catch (err: any) {
      setTeamError(err.message || 'Failed to delete manager');
    }
  };

  const handleDeleteAgencyWorkspace = () => {
    if (confirm(`Are you sure you want to permanently DELETE agency "${agency?.name || 'Unseen Hours'}"?\n\nThis will permanently wipe all creators, rate cards, deals, deliverables, and team managers.`)) {
      resetWorkspaceData();
      localStorage.clear();
      logout();
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface rounded-2xl border border-border shadow-modal max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-accent" />
            <div>
              <h3 className="text-sm font-bold text-white">Account & Workspace Settings</h3>
              <p className="text-[10px] text-slate-300">{agency?.name || 'Unseen Hours'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-border bg-slate-50 px-4 pt-2 gap-1 text-xs">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3 py-2 font-bold rounded-t-lg transition-colors flex items-center gap-1.5 border-b-2 ${
              activeTab === 'profile'
                ? 'bg-white text-accent border-accent shadow-subtle'
                : 'text-ink-muted border-transparent hover:text-ink'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>My Profile</span>
          </button>

          <button
            onClick={() => setActiveTab('password')}
            className={`px-3 py-2 font-bold rounded-t-lg transition-colors flex items-center gap-1.5 border-b-2 ${
              activeTab === 'password'
                ? 'bg-white text-accent border-accent shadow-subtle'
                : 'text-ink-muted border-transparent hover:text-ink'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Change Password</span>
          </button>

          <button
            onClick={() => setActiveTab('team')}
            className={`px-3 py-2 font-bold rounded-t-lg transition-colors flex items-center gap-1.5 border-b-2 ${
              activeTab === 'team'
                ? 'bg-white text-accent border-accent shadow-subtle'
                : 'text-ink-muted border-transparent hover:text-ink'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Managers & Agency</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          
          {/* TAB 1: PROFILE */}
          {activeTab === 'profile' && (
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              {profileSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Profile details updated successfully!</span>
                </div>
              )}

              {profileError && (
                <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded-lg text-xs font-bold">
                  {profileError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-ink mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-bg text-ink text-xs rounded-lg border border-border focus:outline-none focus:border-accent font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-bg text-ink text-xs rounded-lg border border-border focus:outline-none focus:border-accent font-bold"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-border rounded-xl flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-ink">Role & Permissions</p>
                  <p className="text-[10px] text-slate-500 capitalize">{user?.role || 'owner'}</p>
                </div>
                <span className="px-2.5 py-1 bg-accent/10 text-accent font-extrabold text-[10px] rounded-full uppercase">
                  {user?.role || 'Owner'}
                </span>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-xs font-bold rounded-lg shadow-subtle transition-colors flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Save Profile</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: CHANGE PASSWORD */}
          {activeTab === 'password' && (
            <form onSubmit={handleChangePassword} className="space-y-4">
              {passwordSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Password updated successfully!</span>
                </div>
              )}

              {passwordError && (
                <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded-lg text-xs font-bold">
                  {passwordError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-ink mb-1">Current Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full pl-9 pr-3 py-2 bg-bg text-ink text-xs rounded-lg border border-border focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-ink mb-1">New Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 6 chars"
                      className="w-full pl-9 pr-3 py-2 bg-bg text-ink text-xs rounded-lg border border-border focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink mb-1">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full pl-9 pr-3 py-2 bg-bg text-ink text-xs rounded-lg border border-border focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-xs font-bold rounded-lg shadow-subtle transition-colors"
                >
                  Update Password
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: MANAGERS & AGENCY */}
          {activeTab === 'team' && (
            <div className="space-y-6">
              {teamSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>{teamSuccess}</span>
                </div>
              )}

              {teamError && (
                <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded-lg text-xs font-bold">
                  {teamError}
                </div>
              )}

              {/* AGENCY NAME EDIT FORM */}
              <form onSubmit={handleUpdateAgencyName} className="p-4 bg-slate-50 rounded-xl border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-ink">Agency Workspace Name</label>
                  <button
                    type="submit"
                    disabled={teamLoading}
                    className="px-3 py-1 bg-accent text-white text-xs font-bold rounded-lg shadow-subtle"
                  >
                    Update Name
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={agencyName}
                  onChange={(e) => setAgencyName(e.target.value)}
                  className="w-full px-3 py-2 bg-white text-ink text-xs font-bold rounded-lg border border-border focus:outline-none focus:border-accent"
                />
              </form>

              {/* MANAGERS SECTION */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-extrabold text-ink">Team Managers ({managers.length})</h4>
                    <p className="text-[10px] text-slate-500">Manage seats, roles, and access credentials.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingManager(!isAddingManager);
                      setEditingManager(null);
                    }}
                    className="py-1 px-2.5 bg-slate-900 text-white text-xs font-bold rounded-lg flex items-center gap-1 hover:bg-slate-800"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Manager</span>
                  </button>
                </div>

                {/* ADD MANAGER FORM */}
                {isAddingManager && (
                  <form onSubmit={handleAddNewManager} className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-xl space-y-3">
                    <h5 className="text-xs font-bold text-indigo-950">Add New Manager Seat</h5>
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
                        placeholder="Email Address"
                        value={newMgrEmail}
                        onChange={(e) => setNewMgrEmail(e.target.value)}
                        className="px-2.5 py-1.5 bg-white border border-border rounded-lg"
                      />
                      <input
                        type="password"
                        required
                        placeholder="Password"
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
                        className="px-3.5 py-1 bg-accent text-white text-xs font-bold rounded shadow-subtle"
                      >
                        Create Manager Seat
                      </button>
                    </div>
                  </form>
                )}

                {/* EDIT MANAGER FORM */}
                {editingManager && (
                  <form onSubmit={handleSaveEditManager} className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl space-y-3">
                    <h5 className="text-xs font-bold text-amber-950">Editing Manager: {editingManager.name}</h5>
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

                {/* DANGER ZONE: DELETE ENTIRE AGENCY WORKSPACE */}
                <div className="pt-4 border-t border-red-200 mt-6 space-y-2">
                  <h4 className="text-xs font-bold text-red-700 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span>Danger Zone: Delete Agency Workspace</span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Permanently delete this entire agency workspace, including all roster creators, rate cards, sponsorship deals, deliverables, and team manager seats.
                  </p>
                  <button
                    type="button"
                    onClick={handleDeleteAgencyWorkspace}
                    className="py-2 px-4 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 shadow-subtle"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                    <span>Delete Entire Agency Workspace</span>
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
