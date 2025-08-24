// pages/admin/AdminOverview.tsx - Admin Dashboard Overview
import React from 'react';
import { DollarSign, Users, Clock, AlertCircle } from 'lucide-react';
import { Card, Badge } from '../../components/ui';
import { useData } from '../../context/DataContext';
import type { Invoice, Client, Task } from '../../types';

const AdminOverview: React.FC = () => {
  const { clients, tasks, invoices } = useData();
  
  const totalRevenue = invoices
    .filter((inv: Invoice) => inv.status === 'paid')
    .reduce((sum: number, inv: Invoice) => sum + inv.amount, 0);
  
  const activeClients = clients.filter((c: Client) => c.status === 'active').length;
  const pendingTasks = tasks.filter((t: Task) => t.status === 'pending' || t.status === 'in-progress').length;
  const overduePayments = invoices.filter((inv: Invoice) => inv.status === 'overdue').length;

  const stats = [
    { name: 'Total Revenue', value: `${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-green-600' },
    { name: 'Active Clients', value: activeClients, icon: Users, color: 'text-blue-600' },
    { name: 'Pending Tasks', value: pendingTasks, icon: Clock, color: 'text-yellow-600' },
    { name: 'Overdue Payments', value: overduePayments, icon: AlertCircle, color: 'text-red-600' }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.name} className="hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Recent Tasks">
          <div className="space-y-4">
            {tasks.slice(0, 5).map((task: Task) => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{task.title}</p>
                  <p className="text-sm text-gray-600">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                </div>
                <Badge variant={
                  task.status === 'completed' ? 'success' :
                  task.status === 'in-progress' ? 'primary' :
                  task.priority === 'high' ? 'danger' : 'default'
                }>
                  {task.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Client Status">
          <div className="space-y-4">
            {clients.slice(0, 5).map((client: Client) => (
              <div key={client.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{client.name}</p>
                  <p className="text-sm text-gray-600">{client.company}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={
                    client.paymentStatus === 'paid' ? 'success' :
                    client.paymentStatus === 'overdue' ? 'danger' : 'warning'
                  }>
                    {client.paymentStatus}
                  </Badge>
                  <Badge variant={
                    client.status === 'active' ? 'success' :
                    client.status === 'pending' ? 'warning' : 'default'
                  }>
                    {client.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminOverview;