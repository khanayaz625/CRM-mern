import React from 'react';
import { Mail, Phone, Calendar, Edit, Trash2, PhoneCall, MessageCircle, Printer, Download, FileText, Table as TableIcon, UserCheck } from 'lucide-react';

const ResponsiveTable = ({
    leads, loading, getStatusColor, updateStatus, openEditModal, handleDeleteLead, user,
    selectedLeads, onSelectLead, onSelectAll,
    onPrint, onExportPDF, onExportXLSX, onAssignLead
}) => {

    const isAllSelected = leads.length > 0 && selectedLeads.length === leads.length;

    // Mobile Card View
    const MobileCard = ({ lead }) => (
        <div className={`p-4 bg-surface border ${selectedLeads.includes(lead._id) ? 'border-primary' : 'border-white/5'} rounded-xl mb-4 space-y-4 shadow-lg transition-colors`}>
            <div className="flex justify-between items-start">
                <div className="flex items-start gap-3">
                    {user?.role === 'admin' && (
                        <input
                            type="checkbox"
                            checked={selectedLeads.includes(lead._id)}
                            onChange={() => onSelectLead(lead._id)}
                            className="mt-1 w-4 h-4 rounded border-white/20 bg-transparent text-primary focus:ring-primary focus:ring-offset-0"
                        />
                    )}
                    <div>
                        <h3 className="font-bold text-white text-lg">{lead.name}</h3>
                        <p className="text-xs text-muted font-medium">{lead.source} • {new Date(lead.createdAt).toLocaleDateString()}</p>
                        {(lead.courseName || lead.collegeName) && (
                            <p className="text-[10px] text-accent font-medium mt-0.5 uppercase tracking-tighter">
                                {lead.courseName} {lead.collegeName ? `| ${lead.collegeName}` : ''}
                            </p>
                        )}
                        {lead.assignedTo && (
                            <p className="text-[10px] text-primary mt-1 uppercase font-bold tracking-wider">Assigned: {lead.assignedTo.name}</p>
                        )}
                    </div>
                </div>
                <div className={`text-xs font-bold px-2 py-1 rounded-full border ${getStatusColor(lead.status)}`}>
                    {lead.status}
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Mail size={14} className="text-muted" /> {lead.email}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Phone size={14} className="text-muted" /> {lead.phone || 'N/A'}
                </div>
                {lead.notes && (
                    <div className="text-xs text-muted italic border-l-2 border-primary/50 pl-2 mt-2">
                        "{lead.notes}"
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
                {lead.phone && (
                    <>
                        <a href={`tel:${lead.phone}`} className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition border border-blue-500/20 text-sm font-medium">
                            <PhoneCall size={16} /> Call
                        </a>
                        <a href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition border border-green-500/20 text-sm font-medium">
                            <MessageCircle size={16} /> WhatsApp
                        </a>
                    </>
                )}
            </div>

            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <select
                    value={lead.status}
                    onChange={(e) => updateStatus(lead._id, e.target.value)}
                    className="bg-background/50 border border-white/10 rounded-lg text-sm px-3 py-2 focus:outline-none text-white w-32"
                >
                    {['New', 'Contacted', 'Qualified', 'Lost', 'Won'].map(s => (
                        <option key={s} value={s} className="bg-surface text-white">{s}</option>
                    ))}
                </select>

                <div className="flex gap-2">
                    <button onClick={() => openEditModal(lead)} className="p-2 bg-white/5 text-gray-300 rounded-lg hover:bg-white/10">
                        <Edit size={16} />
                    </button>
                    {user?.role === 'admin' && (
                        <>
                            <button onClick={() => onAssignLead(lead)} className="p-2 bg-accent/10 text-accent rounded-lg hover:bg-accent/20" title="Assign">
                                <UserCheck size={16} />
                            </button>
                            <button onClick={() => handleDeleteLead(lead._id)} className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20" title="Delete">
                                <Trash2 size={16} />
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="bg-transparent md:glass-card rounded-2xl overflow-hidden shadow-2xl">
            {/* Desktop Table Header */}
            <div className="hidden md:flex p-6 border-b border-white/5 justify-between items-center bg-white/5">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    Recent Leads
                    {selectedLeads.length > 0 && <span className="text-sm font-normal text-primary bg-primary/10 px-3 py-1 rounded-full">{selectedLeads.length} Selected</span>}
                </h2>

                <div className="flex items-center gap-2">
                    {/* Action Bar inside Table Header */}
                    <button
                        onClick={onPrint}
                        className="p-2.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl transition border border-white/5 group relative"
                        title="Print Leads"
                    >
                        <Printer size={18} />
                        <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-surface border border-white/10 px-2 py-1 rounded text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">Print Page</span>
                    </button>

                    <div className="relative group/export">
                        <button className="p-2.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl transition border border-white/5">
                            <Download size={18} />
                        </button>
                        <div className="absolute right-0 top-full mt-2 w-48 bg-surface border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover/export:opacity-100 group-hover/export:visible transition-all z-50 overflow-hidden">
                            <button onClick={onExportPDF} className="w-full text-left px-4 py-3 text-xs hover:bg-white/5 transition flex items-center gap-3 text-gray-300 hover:text-white border-b border-white/5">
                                <FileText size={14} className="text-red-400" /> Export as PDF
                            </button>
                            <button onClick={onExportXLSX} className="w-full text-left px-4 py-3 text-xs hover:bg-white/5 transition flex items-center gap-3 text-gray-300 hover:text-white">
                                <TableIcon size={14} className="text-green-400" /> Export as Excel
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/10 text-sm uppercase text-gray-400">
                            {user?.role === 'admin' && (
                                <th className="p-4 w-10">
                                    <input
                                        type="checkbox"
                                        checked={isAllSelected}
                                        onChange={onSelectAll}
                                        className="w-4 h-4 rounded border-white/20 bg-transparent text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer"
                                    />
                                </th>
                            )}
                            <th className="p-4 font-semibold tracking-wider">Lead Info</th>
                            <th className="p-4 font-semibold tracking-wider">Contact Details</th>
                            {user?.role === 'admin' && <th className="p-4 font-semibold tracking-wider">Assigned To</th>}
                            <th className="p-4 font-semibold tracking-wider">Remarks</th>
                            <th className="p-4 font-semibold tracking-wider">Status</th>
                            <th className="p-4 font-semibold tracking-wider text-right px-6">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            <tr><td colSpan={user?.role === 'admin' ? "7" : "5"} className="p-12 text-center text-muted animate-pulse">Loading amazing leads...</td></tr>
                        ) : leads.map((lead) => (
                            <tr key={lead._id} className={`hover:bg-white/5 transition-colors group ${selectedLeads.includes(lead._id) ? 'bg-primary/5' : ''}`}>
                                {user?.role === 'admin' && (
                                    <td className="p-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedLeads.includes(lead._id)}
                                            onChange={() => onSelectLead(lead._id)}
                                            className="w-4 h-4 rounded border-white/20 bg-transparent text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer"
                                        />
                                    </td>
                                )}
                                <td className="p-4">
                                    <div className="font-bold text-white leading-tight">{lead.name}</div>
                                    <div className="text-xs text-muted mt-1 flex flex-col gap-0.5">
                                        <div className="flex items-center gap-1">
                                            <span className="bg-white/5 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">{lead.source}</span>
                                            <span>•</span>
                                            <span>{new Date(lead.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        {(lead.courseName || lead.collegeName) && (
                                            <div className="text-[10px] text-accent font-medium mt-1 uppercase tracking-tighter">
                                                {lead.courseName} {lead.collegeName ? `| ${lead.collegeName}` : ''}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex flex-col gap-1.5">
                                        <div className="flex items-center gap-2 text-sm text-gray-300"><Mail size={13} className="text-muted" /> {lead.email}</div>
                                        <div className="flex items-center gap-2 text-sm text-gray-300"><Phone size={13} className="text-muted" /> {lead.phone || 'N/A'}</div>
                                    </div>
                                </td>
                                {user?.role === 'admin' && (
                                    <td className="p-4">
                                        {lead.assignedTo ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-[10px] font-bold text-accent">
                                                    {lead.assignedTo.name[0]}
                                                </div>
                                                <span className="text-sm text-gray-300">{lead.assignedTo.name}</span>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-muted italic">Unassigned</span>
                                        )}
                                    </td>
                                )}
                                <td className="p-4 max-w-xs">
                                    {lead.notes ? <p className="text-xs text-gray-400 line-clamp-2" title={lead.notes}>{lead.notes}</p> : <span className="text-xs text-muted">-</span>}
                                </td>
                                <td className="p-4">
                                    <select
                                        value={lead.status}
                                        onChange={(e) => updateStatus(lead._id, e.target.value)}
                                        className={`text-[10px] uppercase tracking-widest font-black px-3 py-1.5 rounded-full border bg-transparent cursor-pointer focus:outline-none shadow-sm transition-all ${getStatusColor(lead.status)}`}
                                    >
                                        {['New', 'Contacted', 'Qualified', 'Lost', 'Won'].map(s => (
                                            <option key={s} value={s} className="bg-surface text-white">{s}</option>
                                        ))}
                                    </select>
                                </td>
                                <td className="p-4 text-right px-6">
                                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {lead.phone && (
                                            <>
                                                <a href={`tel:${lead.phone}`} title="Call" className="p-2 hover:bg-blue-500/20 text-blue-400 rounded-lg transition border border-transparent">
                                                    <PhoneCall size={16} />
                                                </a>
                                                <a href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`} title="WhatsApp" target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-green-500/20 text-green-400 rounded-lg transition border border-transparent">
                                                    <MessageCircle size={16} />
                                                </a>
                                            </>
                                        )}
                                        <div className="w-px h-6 bg-white/10 mx-1"></div>
                                        <button onClick={() => openEditModal(lead)} className="p-2 hover:bg-white/10 rounded-lg transition text-gray-300" title="Edit">
                                            <Edit size={16} />
                                        </button>
                                        {user?.role === 'admin' && (
                                            <>
                                                <button onClick={() => onAssignLead(lead)} className="p-2 hover:bg-accent/10 rounded-lg transition text-accent" title="Assign Lead">
                                                    <UserCheck size={16} />
                                                </button>
                                                <button onClick={() => handleDeleteLead(lead._id)} className="p-2 hover:bg-red-500/10 rounded-lg transition text-red-400" title="Delete">
                                                    <Trash2 size={16} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {leads.length === 0 && !loading && (
                            <tr><td colSpan={user?.role === 'admin' ? "7" : "5"} className="p-12 text-center text-muted text-lg italic">No leads found. Start by adding one!</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile View */}
            <div className="md:hidden p-4">
                {loading ? (
                    <div className="p-8 text-center text-muted">Loading leads...</div>
                ) : (
                    leads.map(lead => <MobileCard key={lead._id} lead={lead} />)
                )}
                {leads.length === 0 && !loading && (
                    <div className="p-8 text-center text-muted">No leads found.</div>
                )}
            </div>
        </div>
    );
};

export default ResponsiveTable;
