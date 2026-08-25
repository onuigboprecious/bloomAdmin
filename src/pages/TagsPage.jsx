import React, { useState, useEffect } from 'react';
import {
  Tag,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Copy,
  QrCode,
  Check,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
  CreditCard,
  Watch,
  X,
} from 'lucide-react';
import { api } from '../services/api';
import { QRCodeModal } from '../components/Common/QRCodeModal';
import { ConfirmModal } from '../components/Common/ConfirmModal';
import { Toast } from '../components/Common/Toast';

export const TagsPage = () => {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All'); // 'All', 'Card', 'Wristband'

  // Modals & Form state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [deletingTag, setDeletingTag] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selectedQrCard, setSelectedQrCard] = useState(null);

  // Form Inputs
  const [newCardUid, setNewCardUid] = useState('');
  const [newHardwareType, setNewHardwareType] = useState('Card'); // 'Card' or 'Wristband'
  const [newStatus, setNewStatus] = useState('provisioned');
  const [formError, setFormError] = useState('');
  const [toastMessage, setToastMessage] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const statusesList = ['provisioned', 'assigned', 'active', 'unassigned'];

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    setLoading(true);
    try {
      const res = await api.getTagsList();
      if (res && res.success) {
        setTags(Array.isArray(res.data) ? res.data : []);
      } else {
        setTags([]);
      }
    } catch (err) {
      setToastMessage({ message: 'Failed to load NFC inventory', type: 'error' });
      setTags([]);
    } finally {
      setLoading(false);
    }
  };

  // Push Single Tag to DB (POST /api/admin/cards)
  const handlePushSingleTag = async (e) => {
    e.preventDefault();
    setFormError('');

    const fullStyleName = newHardwareType === 'Card' ? 'NFC Card' : 'NFC Wristband';

    try {
      const res = await api.createSingleTag({
        cardUid: newCardUid,
        finishName: fullStyleName,
        status: newStatus,
        hardwareType: newHardwareType,
      });

      if (res.success) {
        setToastMessage({
          message: `Single ${newHardwareType} tag '${res.data.cardUid}' pushed successfully to database`,
          type: 'success',
        });
        setIsAddModalOpen(false);
        setNewCardUid('');
        fetchTags();
      }
    } catch (err) {
      setFormError(err.message || 'Failed to push tag to DB');
    }
  };

  // Edit Tag (PATCH /api/admin/cards/:id)
  const handleUpdateTag = async (e) => {
    e.preventDefault();
    if (!editingTag) return;

    try {
      const res = await api.updateTag(editingTag.id, {
        finishName: editingTag.finishName,
        status: editingTag.status,
      });
      if (res.success) {
        setToastMessage({ message: `Tag '${editingTag.cardUid}' updated successfully`, type: 'success' });
        setIsEditModalOpen(false);
        setEditingTag(null);
        fetchTags();
      }
    } catch (err) {
      setToastMessage({ message: err.message || 'Failed to update tag', type: 'error' });
    }
  };

  // Delete Tag (DELETE /api/admin/cards/:cardUid)
  const handleConfirmDelete = async () => {
    if (!deletingTag) return;
    setDeleteLoading(true);

    try {
      const res = await api.deleteTag(deletingTag.cardUid || deletingTag.id);
      if (res && res.success) {
        setToastMessage({ message: `Tag '${deletingTag.cardUid}' deleted from database`, type: 'info' });
        setDeletingTag(null);
        fetchTags();
      }
    } catch (err) {
      setToastMessage({ message: err.message || 'Failed to delete tag', type: 'error' });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCopyUrl = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setToastMessage({ message: 'Encoding URL copied', type: 'info' });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const safeTags = Array.isArray(tags) ? tags : [];

  // Filtering
  const filteredTags = safeTags.filter((t) => {
    const uidStr = String(t?.cardUid || '');
    const sigStr = String(t?.signature || '');
    const finishStr = String(t?.finishName || '');
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      uidStr.toLowerCase().includes(search) ||
      sigStr.toLowerCase().includes(search) ||
      finishStr.toLowerCase().includes(search);
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    const matchesType =
      typeFilter === 'All' ||
      (typeFilter === 'Wristband' ? finishStr.includes('Wristband') : !finishStr.includes('Wristband'));
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Toast Notification */}
      <Toast
        message={toastMessage?.message}
        type={toastMessage?.type}
        onClose={() => setToastMessage(null)}
      />

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-[#0088CC] text-xs font-mono mb-2">
            <Tag className="w-3.5 h-3.5" />
            NFC INVENTORY SYSTEM (CARDS & WRISTBANDS)
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">NFC Inventory Management</h1>
          <p className="text-sm text-slate-600 mt-1">
            Manage single NFC tag registrations for Cards and Wristbands, verify UID uniqueness, and edit details.
          </p>
        </div>
        <button
          onClick={() => {
            setNewCardUid('');
            setFormError('');
            setIsAddModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#0088CC] hover:bg-[#007AAB] text-white font-extrabold text-sm shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          Push Single Tag to DB
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-panel p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center shadow-sm">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search UID, Signature, Style..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-[#0088CC]"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Form Factor Filter: Card vs Wristband */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 px-3 py-2.5 focus:outline-none focus:border-[#0088CC]"
            >
              <option value="All">All Form Factors</option>
              <option value="Card">🎴 Cards Only</option>
              <option value="Wristband">⌚ Wristbands Only</option>
            </select>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 px-3 py-2.5 focus:outline-none focus:border-[#0088CC]"
          >
            <option value="All">All Statuses</option>
            {statusesList.map((s) => (
              <option key={s} value={s}>
                {s.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tags Inventory Table */}
      <div className="glass-panel rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <span className="text-xs font-mono text-slate-500">
            Showing <strong className="text-slate-900">{filteredTags.length}</strong> of {safeTags.length} NFC Tags
          </span>
          <button
            onClick={fetchTags}
            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg bg-slate-100"
            title="Refresh Inventory"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-xs font-mono uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Hardware UID</th>
                <th className="px-6 py-3.5">Signature</th>
                <th className="px-6 py-3.5">Form Factor & Finish</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Tap Count</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono text-xs">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-slate-500">
                    Loading NFC database...
                  </td>
                </tr>
              ) : filteredTags.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12">
                    <div className="flex flex-col items-center justify-center py-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3 border border-slate-200">
                        <Tag className="w-6 h-6" />
                      </div>
                      <p className="text-base font-bold text-slate-800">No data yet</p>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm">No NFC tags have been provisioned or recorded in the database yet.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTags.map((tag) => {
                  const isWristband = String(tag.finishName || '').includes('Wristband');

                  return (
                    <tr key={tag.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-[#0088CC]" />
                        {tag.cardUid}
                      </td>
                      <td className="px-6 py-4 text-[#0088CC] font-semibold">{tag.signature}</td>
                      <td className="px-6 py-4 font-sans text-slate-700">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 border border-slate-200">
                          {isWristband ? (
                            <Watch className="w-3.5 h-3.5 text-purple-600" />
                          ) : (
                            <CreditCard className="w-3.5 h-3.5 text-[#0088CC]" />
                          )}
                          {tag.finishName}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                            tag.status === 'provisioned'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : tag.status === 'assigned'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : tag.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {tag.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-800">{tag.tapCount || 0} Taps</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleCopyUrl(tag.encodingUrl, tag.id)}
                            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                            title="Copy Encoding URL"
                          >
                            {copiedId === tag.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            onClick={() => setSelectedQrCard(tag)}
                            className="p-2 rounded-lg bg-cyan-50 text-[#0088CC] hover:bg-cyan-100 border border-cyan-200"
                            title="QR Code"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingTag({ ...tag });
                              setIsEditModalOpen(true);
                            }}
                            className="p-2 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"
                            title="Edit Tag"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingTag(tag)}
                            className="p-2 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                            title="Delete Tag"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Push Single Tag Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-2xl text-slate-900 relative">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 p-1"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold mb-1">Push Single NFC Tag to DB</h3>
            <p className="text-xs text-slate-500 mb-4">
              Calls <code className="text-[#0088CC] font-mono">POST /api/admin/cards</code> with tag payload.
            </p>

            {formError && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handlePushSingleTag} className="space-y-4">
              {/* Form Factor Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 font-mono">
                  Select Form Factor (Card vs Wristband)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setNewHardwareType('Card');
                      setNewFinishName('Stealth Matte Black');
                    }}
                    className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                      newHardwareType === 'Card'
                        ? 'bg-cyan-50 border-[#0088CC] text-[#0088CC]'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Card</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewHardwareType('Wristband');
                      setNewFinishName('Silicone Sport Black');
                    }}
                    className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                      newHardwareType === 'Wristband'
                        ? 'bg-purple-50 border-purple-600 text-purple-700'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <Watch className="w-4 h-4" />
                    <span>Wristband</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 font-mono">
                  Card / Tag UID (Leave empty to auto-generate)
                </label>
                <input
                  type="text"
                  placeholder="e.g. BLM-88A92K-NFC"
                  value={newCardUid}
                  onChange={(e) => setNewCardUid(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono text-sm focus:outline-none focus:border-[#0088CC]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 font-mono">
                  {newHardwareType} Style / Finish
                </label>
                <select
                  value={newFinishName}
                  onChange={(e) => setNewFinishName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-[#0088CC]"
                >
                  {activeFinishes.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 font-mono">
                  Initial Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-[#0088CC]"
                >
                  {statusesList.map((s) => (
                    <option key={s} value={s}>
                      {s.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#0088CC] text-white font-extrabold text-sm hover:bg-[#007AAB]"
                >
                  Push Tag to DB
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Edit Tag Modal */}
      {isEditModalOpen && editingTag && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 text-slate-900 relative shadow-2xl">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 p-1"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold mb-1">Edit NFC Tag</h3>
            <p className="text-xs font-mono text-[#0088CC] mb-6">{editingTag.cardUid}</p>

            <form onSubmit={handleUpdateTag} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 font-mono">
                  Finish Name & Form Factor
                </label>
                <input
                  type="text"
                  value={editingTag.finishName}
                  onChange={(e) => setEditingTag({ ...editingTag, finishName: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 font-mono">
                  Tag Status
                </label>
                <select
                  value={editingTag.status}
                  onChange={(e) => setEditingTag({ ...editingTag, status: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-amber-500"
                >
                  {statusesList.map((s) => (
                    <option key={s} value={s}>
                      {s.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-500 text-white font-extrabold text-sm hover:bg-amber-600"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Dialog Modal */}
      <QRCodeModal
        isOpen={!!selectedQrCard}
        onClose={() => setSelectedQrCard(null)}
        cardData={selectedQrCard}
        onCopy={(msg) => setToastMessage({ message: msg, type: 'info' })}
      />

      {/* Delete Confirmation Custom Modal */}
      <ConfirmModal
        isOpen={!!deletingTag}
        title="Delete NFC Tag"
        message={`Are you sure you want to delete tag '${deletingTag?.cardUid}'? This action cannot be undone.`}
        confirmText="Delete Tag"
        cancelText="Cancel"
        type="danger"
        loading={deleteLoading}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingTag(null)}
      />
    </div>
  );
};
