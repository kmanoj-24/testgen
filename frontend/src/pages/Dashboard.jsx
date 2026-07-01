import { Link } from 'react-router-dom';
import { Ticket, FileCheck, Clock, AlertCircle } from 'lucide-react';

const stats = [
  { name: 'Total Tickets', value: '0', icon: Ticket, color: 'bg-blue-500' },
  { name: 'Test Cases Generated', value: '0', icon: FileCheck, color: 'bg-green-500' },
  { name: 'Pending Review', value: '0', icon: Clock, color: 'bg-yellow-500' },
  { name: 'Issues', value: '0', icon: AlertCircle, color: 'bg-red-500' },
];

export const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Welcome to TestGen AI. Start by fetching Jira tickets.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="card p-5">
            <div className="flex items-center">
              <div className={`${stat.color} rounded-lg p-3`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            to="/tickets"
            className="flex items-center p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-primary-500 hover:bg-primary-50 transition-colors group"
          >
            <div className="bg-primary-100 rounded-lg p-3 group-hover:bg-primary-200 transition-colors">
              <Ticket className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-900">Fetch Jira Tickets</p>
              <p className="text-xs text-gray-500">Select tickets to generate test cases</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};