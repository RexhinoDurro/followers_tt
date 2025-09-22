// client/src/dashboard/admin/AdminInvoices.tsx
import React, { useState, useEffect } from 'react';
import {
  DollarSign, FileText, Download, Plus, Search,
  CheckCircle,  AlertCircle,
  Clock, TrendingUp, Printer, Mail,
  ChevronDown, ChevronUp, Eye
} from 'lucide-react';
import { Card, Button, Modal, Input, Badge } from '../../components/ui';
import ApiService from '../../services/ApiService';

interface Invoice {
  id: string;
  client: string;
  client_name: string;
  invoice_number: string;
  amount: number;
  due_date: string;
  status: 'paid' | 'pending' | 'overdue';
  paid_at?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

interface Client {
  id: string;
  name: string;
  email: string;
  company: string;
  monthly_fee: number;
  payment_status: string;
}

interface InvoiceStats {
  totalRevenue: number;
  pendingAmount: number;
  overdueAmount: number;
  paidThisMonth: number;
  totalInvoices: number;
  paidInvoices: number;
  pendingInvoices: number;
  overdueInvoices: number;
}

const AdminInvoices: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterClient, setFilterClient] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showCreateInvoice, setShowCreateInvoice] = useState(false);
  const [, setShowInvoiceDetails] = useState(false);
  const [, setSelectedInvoice] = useState<Invoice | null>(null);
  const [stats, setStats] = useState<InvoiceStats | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [newInvoice, setNewInvoice] = useState({
    client: '',
    amount: '',
    due_date: '',
    description: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [invoicesData, clientsData] = await Promise.all([
        ApiService.getInvoices(),
        ApiService.getClients()
      ]);

      const invoicesArray = Array.isArray(invoicesData) ? invoicesData : [];
      const clientsArray = Array.isArray(clientsData) ? clientsData : [];
      
      setInvoices(invoicesArray);
      setClients(clientsArray);
      
      // Calculate stats
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const stats: InvoiceStats = {
        totalRevenue: invoicesArray
          .filter(inv => inv.status === 'paid')
          .reduce((sum, inv) => sum + inv.amount, 0),
        pendingAmount: invoicesArray
          .filter(inv => inv.status === 'pending')
          .reduce((sum, inv) => sum + inv.amount, 0),
        overdueAmount: invoicesArray
          .filter(inv => inv.status === 'overdue')
          .reduce((sum, inv) => sum + inv.amount, 0),
        paidThisMonth: invoicesArray
          .filter(inv => {
            if (inv.status === 'paid' && inv.paid_at) {
              const paidDate = new Date(inv.paid_at);
              return paidDate.getMonth() === currentMonth && paidDate.getFullYear() === currentYear;
            }
            return false;
          })
          .reduce((sum, inv) => sum + inv.amount, 0),
        totalInvoices: invoicesArray.length,
        paidInvoices: invoicesArray.filter(inv => inv.status === 'paid').length,
        pendingInvoices: invoicesArray.filter(inv => inv.status === 'pending').length,
        overdueInvoices: invoicesArray.filter(inv => inv.status === 'overdue').length
      };
      
      setStats(stats);
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const invoiceData = {
        ...newInvoice,
        amount: parseFloat(newInvoice.amount),
        invoice_number: `INV-${Date.now()}`
      };
      
      await ApiService.createInvoice(invoiceData);
      setShowCreateInvoice(false);
      setNewInvoice({ client: '', amount: '', due_date: '', description: '' });
      await fetchData();
    } catch (error) {
      console.error('Failed to create invoice:', error);
    }
  };

  const handleMarkPaid = async (invoiceId: string) => {
    try {
      await ApiService.markInvoicePaid(invoiceId);
      await fetchData();
    } catch (error) {
      console.error('Failed to mark invoice as paid:', error);
    }
  };

  const handleSendReminder = async (invoice: Invoice) => {
    // In a real app, this would send an email
    alert(`Reminder sent to ${invoice.client_name} for invoice ${invoice.invoice_number}`);
  };

  const handleSort = (key: 'date' | 'amount' | 'status') => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('desc');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'overdue':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const filteredInvoices = invoices
    .filter(invoice => {
      const matchesSearch = 
        invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || invoice.status === filterStatus;
      const matchesClient = filterClient === 'all' || invoice.client === filterClient;
      
      let matchesDate = true;
      if (dateRange.start && dateRange.end) {
        const invoiceDate = new Date(invoice.created_at);
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        matchesDate = invoiceDate >= startDate && invoiceDate <= endDate;
      }
      
      return matchesSearch && matchesStatus && matchesClient && matchesDate;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          break;
        case 'amount':
          comparison = b.amount - a.amount;
          break;
        case 'status':
          const statusOrder = { paid: 0, pending: 1, overdue: 2 };
          comparison = statusOrder[a.status] - statusOrder[b.status];
          break;
      }
      
      return sortOrder === 'asc' ? -comparison : comparison;
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Invoice Management</h1>
          <p className="text-gray-600 mt-1">Track payments and manage client invoices</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setShowCreateInvoice(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Invoice
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Total Revenue</p>
                <p className="text-3xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
                <p className="text-sm text-green-100 mt-1">
                  {stats.paidInvoices} paid invoices
                </p>
              </div>
              <DollarSign className="w-10 h-10 text-green-200" />
            </div>
          </Card>
          
          <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100">Pending</p>
                <p className="text-3xl font-bold">{formatCurrency(stats.pendingAmount)}</p>
                <p className="text-sm text-yellow-100 mt-1">
                  {stats.pendingInvoices} invoices
                </p>
              </div>
              <Clock className="w-10 h-10 text-yellow-200" />
            </div>
          </Card>
          
          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100">Overdue</p>
                <p className="text-3xl font-bold">{formatCurrency(stats.overdueAmount)}</p>
                <p className="text-sm text-red-100 mt-1">
                  {stats.overdueInvoices} invoices
                </p>
              </div>
              <AlertCircle className="w-10 h-10 text-red-200" />
            </div>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">This Month</p>
                <p className="text-3xl font-bold">{formatCurrency(stats.paidThisMonth)}</p>
                <p className="text-sm text-purple-100 mt-1">
                  Collected
                </p>
              </div>
              <TrendingUp className="w-10 h-10 text-purple-200" />
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>
          
          <select
            value={filterClient}
            onChange={(e) => setFilterClient(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Clients</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>
                {client.name} - {client.company}
              </option>
            ))}
          </select>
          
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            placeholder="Start Date"
          />
          
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            placeholder="End Date"
          />
        </div>
      </Card>

      {/* Invoices Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left pb-3 font-medium text-gray-900">
                  <button
                    onClick={() => handleSort('date')}
                    className="flex items-center hover:text-purple-600"
                  >
                    Invoice
                    {sortBy === 'date' && (sortOrder === 'desc' ? <ChevronDown className="w-4 h-4 ml-1" /> : <ChevronUp className="w-4 h-4 ml-1" />)}
                  </button>
                </th>
                <th className="text-left pb-3 font-medium text-gray-900">Client</th>
                <th className="text-left pb-3 font-medium text-gray-900">
                  <button
                    onClick={() => handleSort('amount')}
                    className="flex items-center hover:text-purple-600"
                  >
                    Amount
                    {sortBy === 'amount' && (sortOrder === 'desc' ? <ChevronDown className="w-4 h-4 ml-1" /> : <ChevronUp className="w-4 h-4 ml-1" />)}
                  </button>
                </th>
                <th className="text-left pb-3 font-medium text-gray-900">Due Date</th>
                <th className="text-left pb-3 font-medium text-gray-900">
                  <button
                    onClick={() => handleSort('status')}
                    className="flex items-center hover:text-purple-600"
                  >
                    Status
                    {sortBy === 'status' && (sortOrder === 'desc' ? <ChevronDown className="w-4 h-4 ml-1" /> : <ChevronUp className="w-4 h-4 ml-1" />)}
                  </button>
                </th>
                <th className="text-left pb-3 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredInvoices.map((invoice) => {
                const isOverdue = invoice.status === 'pending' && new Date(invoice.due_date) < new Date();
                
                return (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="py-4">
                      <div>
                        <p className="font-medium text-gray-900">#{invoice.invoice_number}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(invoice.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </td>
                    <td className="py-4">
                      <p className="font-medium text-gray-900">{invoice.client_name}</p>
                      <p className="text-sm text-gray-500">{invoice.description}</p>
                    </td>
                    <td className="py-4">
                      <p className="font-bold text-gray-900">{formatCurrency(invoice.amount)}</p>
                    </td>
                    <td className="py-4">
                      <p className={`${isOverdue ? 'text-red-600 font-medium' : 'text-gray-700'}`}>
                        {new Date(invoice.due_date).toLocaleDateString()}
                      </p>
                      {isOverdue && (
                        <p className="text-xs text-red-600">Overdue</p>
                      )}
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(invoice.status)}
                        <Badge variant={
                          invoice.status === 'paid' ? 'success' :
                          invoice.status === 'overdue' || isOverdue ? 'danger' : 'warning'
                        }>
                          {invoice.status}
                        </Badge>
                      </div>
                      {invoice.status === 'paid' && invoice.paid_at && (
                        <p className="text-xs text-gray-500 mt-1">
                          Paid on {new Date(invoice.paid_at).toLocaleDateString()}
                        </p>
                      )}
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedInvoice(invoice);
                            setShowInvoiceDetails(true);
                          }}
                          className="p-1 hover:bg-gray-100 rounded"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 text-gray-600" />
                        </button>
                        
                        {invoice.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleMarkPaid(invoice.id)}
                              className="p-1 hover:bg-gray-100 rounded"
                              title="Mark as Paid"
                            >
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            </button>
                            <button
                              onClick={() => handleSendReminder(invoice)}
                              className="p-1 hover:bg-gray-100 rounded"
                              title="Send Reminder"
                            >
                              <Mail className="w-4 h-4 text-blue-600" />
                            </button>
                          </>
                        )}
                        
                        <button
                          className="p-1 hover:bg-gray-100 rounded"
                          title="Download PDF"
                        >
                          <Download className="w-4 h-4 text-gray-600" />
                        </button>
                        
                        <button
                          className="p-1 hover:bg-gray-100 rounded"
                          title="Print"
                        >
                          <Printer className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {filteredInvoices.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No invoices found</p>
            </div>
          )}
        </div>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Recent Payments">
          <div className="space-y-3">
            {invoices
              .filter(inv => inv.status === 'paid')
              .slice(0, 5)
              .map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">{invoice.client_name}</p>
                      <p className="text-sm text-gray-600">Invoice #{invoice.invoice_number}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{formatCurrency(invoice.amount)}</p>
                    <p className="text-xs text-gray-500">
                      {invoice.paid_at && new Date(invoice.paid_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </Card>

        <Card title="Overdue Invoices">
          <div className="space-y-3">
            {invoices
              .filter(inv => {
                const isOverdue = inv.status === 'pending' && new Date(inv.due_date) < new Date();
                return inv.status === 'overdue' || isOverdue;
              })
              .slice(0, 5)
              .map((invoice) => {
                const daysOverdue = Math.floor((new Date().getTime() - new Date(invoice.due_date).getTime()) / (1000 * 60 * 60 * 24));
                
                return (
                  <div key={invoice.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center">
                      <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">{invoice.client_name}</p>
                        <p className="text-sm text-red-600">{daysOverdue} days overdue</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{formatCurrency(invoice.amount)}</p>
                      <Button size="sm" variant="danger" onClick={() => handleSendReminder(invoice)}>
                        Send Reminder
                      </Button>
                    </div>
                  </div>
                );
              })}
            
            {invoices.filter(inv => inv.status === 'overdue' || (inv.status === 'pending' && new Date(inv.due_date) < new Date())).length === 0 && (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="text-gray-600">No overdue invoices!</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Create Invoice Modal */}
      <Modal
        isOpen={showCreateInvoice}
        onClose={() => setShowCreateInvoice(false)}
        title="Create New Invoice"
        size="md"
      >
        <form onSubmit={handleCreateInvoice} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Client</label>
            <select
              value={newInvoice.client}
              onChange={(e) => setNewInvoice({ ...newInvoice, client: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              required
            >
              <option value="">Select Client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name} - {client.company} (${client.monthly_fee}/mo)
                </option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Amount"
              type="number"
              step="0.01"
              value={newInvoice.amount}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewInvoice({ ...newInvoice, amount: e.target.value })}
              required
            />
            <Input
              label="Due Date"
              type="date"
              value={newInvoice.due_date}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewInvoice({ ...newInvoice, due_date: e.target.value })}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={newInvoice.description}
              onChange={(e) => setNewInvoice({ ...newInvoice, description: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              rows={3}
              placeholder="Service description..."
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowCreateInvoice(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Create Invoice
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminInvoices;