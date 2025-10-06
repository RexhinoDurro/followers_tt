// client/src/dashboard/admin/AdminTasks.tsx
import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, Plus, Search,  MoreVertical, Edit, Trash2,
  Clock, AlertCircle, Calendar, User,
  PlayCircle,  CheckSquare, 
  Target, ArrowUp, ArrowDown,
  Zap, AlertTriangle, Info, List, Kanban
} from 'lucide-react';
import { Card, Button, Modal, Input, Badge } from '../../components/ui';
import ApiService from '../../services/ApiService';

interface Task {
  id: string;
  title: string;
  description: string;
  client: string;
  client_name: string;
  assigned_to: string;
  status: 'pending' | 'in-progress' | 'review' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_date: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

interface Client {
  id: string;
  name: string;
  company: string;
}

const AdminTasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterClient, setFilterClient] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('kanban');
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showEditTask, setShowEditTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showBulkActions, setShowBulkActions] = useState(false);

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    client: '',
    assigned_to: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    due_date: '',
    status: 'pending' as 'pending' | 'in-progress' | 'review' | 'completed'
  });

  const teamMembers = [
    'John Smith',
    'Sarah Johnson',
    'Mike Wilson',
    'Emma Davis',
    'Chris Brown',
    'Lisa Anderson'
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tasksData, clientsData] = await Promise.all([
        ApiService.getTasks(),
        ApiService.getClients()
      ]);
      
      setTasks(Array.isArray(tasksData) ? tasksData : []);
      setClients(Array.isArray(clientsData) ? clientsData : []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ApiService.createTask(newTask);
      await fetchData();
      setShowAddTask(false);
      setNewTask({
        title: '',
        description: '',
        client: '',
        assigned_to: '',
        priority: 'medium',
        due_date: '',
        status: 'pending'
      });
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      await ApiService.updateTask(taskId, updates);
      await fetchData();
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await ApiService.deleteTask(taskId);
      await fetchData();
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handleBulkStatusUpdate = async (status: string) => {
    try {
      await ApiService.bulkUpdateTasks({
        task_ids: selectedTasks,
        status: status as any
      });
      await fetchData();
      setSelectedTasks([]);
      setShowBulkActions(false);
    } catch (error) {
      console.error('Failed to update tasks:', error);
    }
  };

  const toggleTaskSelection = (taskId: string) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const selectAllTasks = () => {
    if (selectedTasks.length === filteredTasks.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(filteredTasks.map(task => task.id));
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <ArrowUp className="w-4 h-4 text-red-500" />;
      case 'medium':
        return <ArrowDown className="w-4 h-4 text-yellow-500" />;
      case 'low':
        return <ArrowDown className="w-4 h-4 text-green-500" />;
      default:
        return null;
    }
  };



  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date() && !dueDate.includes('completed');
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.assigned_to.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    const matchesClient = filterClient === 'all' || task.client === filterClient;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesClient;
  });

  const tasksByStatus = {
    pending: filteredTasks.filter(t => t.status === 'pending'),
    'in-progress': filteredTasks.filter(t => t.status === 'in-progress'),
    review: filteredTasks.filter(t => t.status === 'review'),
    completed: filteredTasks.filter(t => t.status === 'completed')
  };

  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    overdue: tasks.filter(t => isOverdue(t.due_date) && t.status !== 'completed').length,
    highPriority: tasks.filter(t => t.priority === 'high' && t.status !== 'completed').length,
    completionRate: tasks.length > 0 
      ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100)
      : 0
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const TaskCard = ({ task }: { task: Task }) => (
    <div
      className={`bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200 border ${
        isOverdue(task.due_date) && task.status !== 'completed' ? 'border-red-200' : 'border-gray-200'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start space-x-2">
          {viewMode === 'kanban' && (
            <input
              type="checkbox"
              checked={selectedTasks.includes(task.id)}
              onChange={() => toggleTaskSelection(task.id)}
              className="mt-1"
            />
          )}
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 line-clamp-2">{task.title}</h4>
            <p className="text-sm text-gray-500 mt-1">{task.client_name}</p>
          </div>
        </div>
        <div className="relative group">
          <button className="p-1 hover:bg-gray-100 rounded">
            <MoreVertical className="w-4 h-4 text-gray-400" />
          </button>
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
            <button
              onClick={() => {
                setSelectedTask(task);
                setShowEditTask(true);
              }}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Edit Task
            </button>
            <button
              onClick={() => handleDeleteTask(task.id)}
              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              Delete Task
            </button>
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
        {task.description}
      </p>

      <div className="flex items-center gap-2 mb-3">
        <Badge variant={getPriorityColor(task.priority)}>
          <div className="flex items-center gap-1">
            {getPriorityIcon(task.priority)}
            {task.priority}
          </div>
        </Badge>
        {isOverdue(task.due_date) && task.status !== 'completed' && (
          <Badge variant="danger">Overdue</Badge>
        )}
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center text-gray-600">
          <User className="w-4 h-4 mr-2" />
          {task.assigned_to}
        </div>
        <div className="flex items-center text-gray-600">
          <Calendar className="w-4 h-4 mr-2" />
          {new Date(task.due_date).toLocaleDateString()}
        </div>
      </div>

      {viewMode === 'kanban' && (
        <div className="mt-4 pt-3 border-t">
          <select
            value={task.status}
            onChange={(e) => handleUpdateTask(task.id, { status: e.target.value as any })}
            className="w-full text-sm border rounded px-2 py-1 focus:ring-2 focus:ring-purple-500"
          >
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="review">Review</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Task Management</h1>
          <p className="text-gray-600 mt-1">Track and manage all client tasks</p>
        </div>
        <div className="flex gap-3">
          {selectedTasks.length > 0 && (
            <Button 
              variant="outline"
              onClick={() => setShowBulkActions(!showBulkActions)}
            >
              <CheckSquare className="w-4 h-4 mr-2" />
              {selectedTasks.length} Selected
            </Button>
          )}
          <Button onClick={() => setShowAddTask(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Tasks</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <CheckSquare className="w-8 h-8 text-blue-200" />
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">Pending</p>
              <p className="text-2xl font-bold">{stats.pending}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-200" />
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm">In Progress</p>
              <p className="text-2xl font-bold">{stats.inProgress}</p>
            </div>
            <PlayCircle className="w-8 h-8 text-indigo-200" />
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Completed</p>
              <p className="text-2xl font-bold">{stats.completed}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-200" />
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Overdue</p>
              <p className="text-2xl font-bold">{stats.overdue}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-200" />
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">High Priority</p>
              <p className="text-2xl font-bold">{stats.highPriority}</p>
            </div>
            <Zap className="w-8 h-8 text-purple-200" />
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-teal-500 to-teal-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-100 text-sm">Completion</p>
              <p className="text-2xl font-bold">{stats.completionRate}%</p>
            </div>
            <Target className="w-8 h-8 text-teal-200" />
          </div>
        </Card>
      </div>

      {/* Bulk Actions */}
      {showBulkActions && selectedTasks.length > 0 && (
        <Card className="bg-purple-50 border-purple-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Info className="w-5 h-5 text-purple-600" />
              <span className="text-purple-900 font-medium">
                {selectedTasks.length} task{selectedTasks.length !== 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleBulkStatusUpdate('in-progress')}
              >
                Mark In Progress
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleBulkStatusUpdate('review')}
              >
                Mark for Review
              </Button>
              <Button 
                size="sm" 
                variant="success"
                onClick={() => handleBulkStatusUpdate('completed')}
              >
                Mark Completed
              </Button>
              <Button 
                size="sm" 
                variant="danger"
                onClick={() => {
                  if (window.confirm(`Delete ${selectedTasks.length} tasks?`)) {
                    // Handle bulk delete
                    setSelectedTasks([]);
                  }
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="flex flex-1 gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search tasks..."
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
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="review">Review</option>
              <option value="completed">Completed</option>
            </select>
            
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            
            <select
              value={filterClient}
              onChange={(e) => setFilterClient(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Clients</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-2 rounded-lg ${viewMode === 'kanban' ? 'bg-purple-100 text-purple-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Kanban className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-purple-100 text-purple-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </Card>

      {/* Kanban View */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Pending Column */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-gray-500" />
                <h3 className="font-semibold text-gray-900">Pending</h3>
                <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                  {tasksByStatus.pending.length}
                </span>
              </div>
            </div>
            <div className="space-y-3">
              {tasksByStatus.pending.map(task => (
                <TaskCard key={task.id} task={task} />
              ))}
              {tasksByStatus.pending.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <Clock className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">No pending tasks</p>
                </div>
              )}
            </div>
          </div>

          {/* In Progress Column */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <PlayCircle className="w-5 h-5 text-blue-500" />
                <h3 className="font-semibold text-gray-900">In Progress</h3>
                <span className="bg-blue-200 text-blue-700 text-xs px-2 py-1 rounded-full">
                  {tasksByStatus['in-progress'].length}
                </span>
              </div>
            </div>
            <div className="space-y-3">
              {tasksByStatus['in-progress'].map(task => (
                <TaskCard key={task.id} task={task} />
              ))}
              {tasksByStatus['in-progress'].length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <PlayCircle className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">No tasks in progress</p>
                </div>
              )}
            </div>
          </div>

          {/* Review Column */}
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-yellow-500" />
                <h3 className="font-semibold text-gray-900">Review</h3>
                <span className="bg-yellow-200 text-yellow-700 text-xs px-2 py-1 rounded-full">
                  {tasksByStatus.review.length}
                </span>
              </div>
            </div>
            <div className="space-y-3">
              {tasksByStatus.review.map(task => (
                <TaskCard key={task.id} task={task} />
              ))}
              {tasksByStatus.review.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">No tasks for review</p>
                </div>
              )}
            </div>
          </div>

          {/* Completed Column */}
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <h3 className="font-semibold text-gray-900">Completed</h3>
                <span className="bg-green-200 text-green-700 text-xs px-2 py-1 rounded-full">
                  {tasksByStatus.completed.length}
                </span>
              </div>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {tasksByStatus.completed.slice(0, 5).map(task => (
                <TaskCard key={task.id} task={task} />
              ))}
              {tasksByStatus.completed.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">No completed tasks</p>
                </div>
              )}
              {tasksByStatus.completed.length > 5 && (
                <button className="w-full text-center text-sm text-green-600 hover:text-green-700 font-medium py-2">
                  View all {tasksByStatus.completed.length} completed tasks
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left pb-3">
                    <input
                      type="checkbox"
                      checked={selectedTasks.length === filteredTasks.length && filteredTasks.length > 0}
                      onChange={selectAllTasks}
                    />
                  </th>
                  <th className="text-left pb-3 font-medium text-gray-900">Task</th>
                  <th className="text-left pb-3 font-medium text-gray-900">Client</th>
                  <th className="text-left pb-3 font-medium text-gray-900">Assigned To</th>
                  <th className="text-left pb-3 font-medium text-gray-900">Priority</th>
                  <th className="text-left pb-3 font-medium text-gray-900">Status</th>
                  <th className="text-left pb-3 font-medium text-gray-900">Due Date</th>
                  <th className="text-left pb-3 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredTasks.map((task) => (
                  <tr key={task.id} className={`hover:bg-gray-50 ${isOverdue(task.due_date) && task.status !== 'completed' ? 'bg-red-50' : ''}`}>
                    <td className="py-4">
                      <input
                        type="checkbox"
                        checked={selectedTasks.includes(task.id)}
                        onChange={() => toggleTaskSelection(task.id)}
                      />
                    </td>
                    <td className="py-4">
                      <div>
                        <p className="font-medium text-gray-900">{task.title}</p>
                        <p className="text-sm text-gray-500 truncate max-w-xs">{task.description}</p>
                      </div>
                    </td>
                    <td className="py-4 text-gray-700">{task.client_name}</td>
                    <td className="py-4 text-gray-700">{task.assigned_to}</td>
                    <td className="py-4">
                      <Badge variant={getPriorityColor(task.priority)}>
                        <div className="flex items-center gap-1">
                          {getPriorityIcon(task.priority)}
                          {task.priority}
                        </div>
                      </Badge>
                    </td>
                    <td className="py-4">
                      <select
                        value={task.status}
                        onChange={(e) => handleUpdateTask(task.id, { status: e.target.value as any })}
                        className={`text-sm border rounded px-2 py-1 ${
                          task.status === 'completed' ? 'bg-green-50 text-green-700' :
                          task.status === 'in-progress' ? 'bg-blue-50 text-blue-700' :
                          task.status === 'review' ? 'bg-yellow-50 text-yellow-700' :
                          'bg-gray-50 text-gray-700'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="review">Review</option>
                        <option value="completed">Completed</option>
                      </select>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-700">
                          {new Date(task.due_date).toLocaleDateString()}
                        </span>
                        {isOverdue(task.due_date) && task.status !== 'completed' && (
                          <Badge variant="danger">Overdue</Badge>
                        )}
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            setSelectedTask(task);
                            setShowEditTask(true);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredTasks.length === 0 && (
              <div className="text-center py-12">
                <CheckSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No tasks found</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Add/Edit Task Modal */}
      <Modal
        isOpen={showAddTask || showEditTask}
        onClose={() => {
          setShowAddTask(false);
          setShowEditTask(false);
          setSelectedTask(null);
        }}
        title={showEditTask ? "Edit Task" : "Create New Task"}
        size="lg"
      >
        <form onSubmit={showEditTask ? (e) => {
          e.preventDefault();
          if (selectedTask) {
            handleUpdateTask(selectedTask.id, newTask);
            setShowEditTask(false);
            setSelectedTask(null);
          }
        } : handleCreateTask} className="space-y-4">
          <Input
            label="Task Title"
            value={showEditTask && selectedTask ? selectedTask.title : newTask.title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              if (showEditTask && selectedTask) {
                setSelectedTask({ ...selectedTask, title: e.target.value });
              } else {
                setNewTask({ ...newTask, title: e.target.value });
              }
            }}
            required
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={showEditTask && selectedTask ? selectedTask.description : newTask.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                if (showEditTask && selectedTask) {
                  setSelectedTask({ ...selectedTask, description: e.target.value });
                } else {
                  setNewTask({ ...newTask, description: e.target.value });
                }
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              rows={4}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Client</label>
              <select
                value={showEditTask && selectedTask ? selectedTask.client : newTask.client}
                onChange={(e) => {
                  if (showEditTask && selectedTask) {
                    setSelectedTask({ ...selectedTask, client: e.target.value });
                  } else {
                    setNewTask({ ...newTask, client: e.target.value });
                  }
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                required
              >
                <option value="">Select Client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name} - {client.company}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Assign To</label>
              <select
                value={showEditTask && selectedTask ? selectedTask.assigned_to : newTask.assigned_to}
                onChange={(e) => {
                  if (showEditTask && selectedTask) {
                    setSelectedTask({ ...selectedTask, assigned_to: e.target.value });
                  } else {
                    setNewTask({ ...newTask, assigned_to: e.target.value });
                  }
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                required
              >
                <option value="">Select Team Member</option>
                {teamMembers.map((member) => (
                  <option key={member} value={member}>
                    {member}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                value={showEditTask && selectedTask ? selectedTask.priority : newTask.priority}
                onChange={(e) => {
                  if (showEditTask && selectedTask) {
                    setSelectedTask({ ...selectedTask, priority: e.target.value as any });
                  } else {
                    setNewTask({ ...newTask, priority: e.target.value as any });
                  }
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={showEditTask && selectedTask ? selectedTask.status : newTask.status}
                onChange={(e) => {
                  if (showEditTask && selectedTask) {
                    setSelectedTask({ ...selectedTask, status: e.target.value as any });
                  } else {
                    setNewTask({ ...newTask, status: e.target.value as any });
                  }
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="review">Review</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            
            <Input
              label="Due Date"
              type="datetime-local"
              value={showEditTask && selectedTask ? selectedTask.due_date : newTask.due_date}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                if (showEditTask && selectedTask) {
                  setSelectedTask({ ...selectedTask, due_date: e.target.value });
                } else {
                  setNewTask({ ...newTask, due_date: e.target.value });
                }
              }}
              required
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setShowAddTask(false);
                setShowEditTask(false);
                setSelectedTask(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit">
              {showEditTask ? 'Update Task' : 'Create Task'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminTasks;