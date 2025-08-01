import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, User, Mail, MapPin, Calendar, Truck, Clock } from 'lucide-react';
import { useFleetData } from '../../../hooks/useFleetData';
import { useAuth } from '../../../hooks/useAuth';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { formatTooltipDate, getDaysBetweenDates, parseDate, parseDateEnd } from '../../../utils/dateUtils';
import { formatDate } from '../../../utils/dateUtils';
import { Badge } from '../../../components/ui/Badge';

export function DriverDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, loading, error } = useFleetData();
  const { user } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error}</div>
        <button 
          onClick={() => window.location.reload()} 
          className="text-blue-600 hover:text-blue-700"
        >
          Try again
        </button>
      </div>
    );
  }

  const driver = data.drivers.find(d => d.id === id);
  
  // Get all vehicle schedules for this driver
  const driverSchedules = data.vehicleSchedules.filter(s => s.driverId === id);
  
  // Sort schedules by start date (most recent first)
  const sortedSchedules = [...driverSchedules].sort((a, b) => 
    new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );

  // Get vehicle name by ID
  const getVehicleName = (vehicleId: string): string => {
    const vehicle = data.vehicles.find(v => v.id === vehicleId);
    return vehicle ? vehicle.name : 'Unknown Vehicle';
  };

  // Get vehicle details by ID
  const getVehicleDetails = (vehicleId: string) => {
    const vehicle = data.vehicles.find(v => v.id === vehicleId);
    return vehicle ? `${vehicle.make} ${vehicle.model} ${vehicle.year}` : 'Unknown';
  };

  // Calculate schedule duration
  const getScheduleDuration = (startDate: string, endDate: string): string => {
    const startDateObj = parseDate(startDate);
    const endDateObj = parseDateEnd(endDate);
    const diffDays = getDaysBetweenDates(startDateObj, endDateObj);
    return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
  };

  if (!driver) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 mb-4">Driver not found</div>
        <button 
          onClick={() => navigate('/drivers')} 
          className="text-blue-600 hover:text-blue-700"
        >
          Back to drivers
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/drivers')}
            className="inline-flex items-center text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Drivers
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{driver.name}</h1>
            <p className="text-sm text-gray-600">{driver.email}</p>
          </div>
        </div>
        {user?.isAdmin && (
          <Link
            to={`/drivers/${driver.id}/edit`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Driver
          </Link>
        )}
      </div>

      {/* Driver Profile Card */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center space-x-6">
            <div className="flex-shrink-0">
              <div className="bg-purple-100 h-20 w-20 rounded-full flex items-center justify-center">
                <User className="h-10 w-10 text-purple-600" />
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">{driver.name}</h2>
              <div className="mt-2 space-y-1">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-2" />
                  {driver.email}
                </div>
                {driver.address && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {driver.address}
                  </div>
                )}
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  Driver since {formatDate(driver.createdAt)}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">{driver.assignedVehicle ? 1 : 0}</div>
              <div className="text-sm text-gray-500">Assigned Vehicle</div>
            </div>
          </div>
        </div>
      </div>

      {/* Driver Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Personal Information
            </h3>
            <dl className="grid grid-cols-1 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Driver ID</dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono">{driver.id}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">ID Number</dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono">{driver.idNumber}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Age</dt>
                <dd className="mt-1 text-sm text-gray-900">{driver.age || 'Not specified'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Email Address</dt>
                <dd className="mt-1 text-sm text-gray-900">{driver.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Full Address</dt>
                <dd className="mt-1 text-sm text-gray-900">{driver.address || 'Not specified'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Created</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {formatDate(driver.createdAt)}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Driver Statistics */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Driver Statistics
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-900">Assigned Vehicle</span>
                <span className="text-sm text-gray-500">{driver.assignedVehicle ? 1 : 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-900">Total Schedules</span>
                <span className="text-sm text-gray-500">{driverSchedules.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-900">Active Schedules</span>
                <span className="text-sm text-gray-500">
                  {driverSchedules.filter(s => s.status === 'active').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-900">Vehicle Mileage</span>
                <span className="text-sm text-gray-500">
                  {driver.assignedVehicle?.mileage?.toLocaleString() || '0'} miles
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Assignment History */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            <Clock className="h-5 w-5 inline mr-2" />
            Assignment History ({sortedSchedules.length})
          </h3>
          
          {sortedSchedules.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vehicle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Start Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      End Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedSchedules.map((schedule) => (
                    <tr key={schedule.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {getVehicleName(schedule.vehicleId)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {getVehicleDetails(schedule.vehicleId)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatTooltipDate(schedule.startDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatTooltipDate(schedule.endDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getScheduleDuration(schedule.startDate, schedule.endDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge 
                          type={schedule.status === 'active' ? 'green' : schedule.status === 'scheduled' ? 'blue' : 'gray'} 
                          label={schedule.status === 'active' ? 'Active' : schedule.status === 'scheduled' ? 'Scheduled' : 'Completed'} 
                        />
                      </td>
                      <td className="px-6 py-4">
                        {schedule.notes ? (
                          <div className="text-sm text-gray-900 max-w-xs truncate" title={schedule.notes}>
                            {schedule.notes}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400 italic">No notes</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No assignment history found for this driver</p>
            </div>
          )}
        </div>
      </div>

      {/* Currently Assigned Vehicle */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            <Truck className="h-5 w-5 inline mr-2" />
            Currently Assigned Vehicle
          </h3>
          
          {driver.assignedVehicle ? (
            <div className="bg-blue-50 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Truck className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">{driver.assignedVehicle.name}</h4>
                    <p className="text-sm text-gray-600">
                      {driver.assignedVehicle.make} {driver.assignedVehicle.model} {driver.assignedVehicle.year}
                    </p>
                    <p className="text-sm text-gray-600">
                      License: {driver.assignedVehicle.licensePlate || 'Not specified'}
                    </p>
                    <p className="text-sm text-gray-600">
                      Mileage: {driver.assignedVehicle.mileage?.toLocaleString() || 'N/A'} miles
                    </p>
                  </div>
                </div>
                <Link
                  to={`/vehicles/${driver.assignedVehicle.id}`}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  View Vehicle Details
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No vehicle currently assigned to this driver</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}