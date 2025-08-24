// pages/client/ClientOverview.tsx - Client Dashboard Overview
import React from 'react';
import { Users, TrendingUp, FileText, Target } from 'lucide-react';
import { Card, Badge } from '../../components/ui';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';

const ClientOverview: React.FC = () => {
  const { performance, content, invoices } = useData();
  const { user } = useAuth();
  
  const clientPerformance = performance.find(p => p.clientId === user?.id);
  const clientContent = content.filter(c => c.clientId === user?.id);
  const clientInvoices = invoices.filter(i => i.clientId === user?.id);

  const stats = [
    { name: 'Total Followers', value: clientPerformance?.followers.toLocaleString() || '0', icon: Users, color: 'text-blue-600' },
    { name: 'Engagement Rate', value: `${clientPerformance?.engagement || 0}%`, icon: TrendingUp, color: 'text-green-600' },
    { name: 'Posts This Month', value: clientContent.length, icon: FileText, color: 'text-purple-600' },
    { name: 'Reach', value: clientPerformance?.reach?.toLocaleString() || '0', icon: Target, color: 'text-orange-600' }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
      
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
        <Card title="Recent Content">
          <div className="space-y-4">
            {clientContent.slice(0, 5).map((post) => (
              <div key={post.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{post.platform}</p>
                  <p className="text-sm text-gray-600 truncate">{post.content}</p>
                </div>
                <Badge variant={
                  post.status === 'posted' ? 'success' :
                  post.status === 'approved' ? 'primary' :
                  post.status === 'pending-approval' ? 'warning' : 'default'
                }>
                  {post.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Payment History">
          <div className="space-y-4">
            {clientInvoices.slice(0, 5).map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">#{invoice.invoiceNumber}</p>
                  <p className="text-sm text-gray-600">{new Date(invoice.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">${invoice.amount}</p>
                  <Badge variant={
                    invoice.status === 'paid' ? 'success' :
                    invoice.status === 'overdue' ? 'danger' : 'warning'
                  }>
                    {invoice.status}
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

export default ClientOverview;