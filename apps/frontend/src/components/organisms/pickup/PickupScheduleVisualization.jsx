import React, { useState } from 'react';
import { format, startOfWeek, addDays, isSameDay, parseISO, isWithinInterval } from 'date-fns';
import { id } from 'date-fns/locale';
import { Calendar, Clock, MapPin, Truck, Users, Package, AlertTriangle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

// Mock data - replace with actual API calls in production
const fetchPickupAssignments = async () => {
  // In production, this would be an API call
  return [
    {
      id: 'PA001',
      code: 'PA-20250503-001',
      team: { id: 'T1', name: 'Team Alpha' },
      vehicle: { id: 'V1', name: 'Toyota Hiace', plateNumber: 'B 1234 CD' },
      date: '2025-05-03',
      timeWindow: { start: '09:00', end: '12:00' },
      status: 'in_progress',
      pickupRequests: [
        { id: 'PR001', code: 'PR-20250503-001', scheduledTime: '09:30', address: 'Jl. Sudirman No. 123, Jakarta', customer: 'PT Maju Bersama' },
        { id: 'PR002', code: 'PR-20250503-002', scheduledTime: '10:30', address: 'Jl. Gatot Subroto No. 456, Jakarta', customer: 'CV Sejahtera' },
      ]
    },
    {
      id: 'PA002',
      code: 'PA-20250503-002',
      team: { id: 'T2', name: 'Team Bravo' },
      vehicle: { id: 'V2', name: 'Mitsubishi L300', plateNumber: 'B 5678 EF' },
      date: '2025-05-03',
      timeWindow: { start: '13:00', end: '16:00' },
      status: 'pending',
      pickupRequests: [
        { id: 'PR003', code: 'PR-20250503-003', scheduledTime: '13:30', address: 'Jl. Thamrin No. 789, Jakarta', customer: 'PT Sukses Makmur' },
        { id: 'PR004', code: 'PR-20250503-004', scheduledTime: '14:30', address: 'Jl. Kuningan No. 101, Jakarta', customer: 'PT Bahagia Selalu' },
      ]
    },
    {
      id: 'PA003',
      code: 'PA-20250503-003',
      team: { id: 'T3', name: 'Team Charlie' },
      vehicle: { id: 'V3', name: 'Daihatsu Gran Max', plateNumber: 'B 9012 GH' },
      date: '2025-05-04',
      timeWindow: { start: '10:00', end: '13:00' },
      status: 'pending',
      pickupRequests: [
        { id: 'PR005', code: 'PR-20250504-001', scheduledTime: '10:30', address: 'Jl. Casablanca No. 202, Jakarta', customer: 'PT Maju Terus' },
        { id: 'PR006', code: 'PR-20250504-002', scheduledTime: '11:30', address: 'Jl. Rasuna Said No. 303, Jakarta', customer: 'CV Berkah Jaya' },
      ]
    },
    {
      id: 'PA004',
      code: 'PA-20250504-001',
      team: { id: 'T1', name: 'Team Alpha' },
      vehicle: { id: 'V1', name: 'Toyota Hiace', plateNumber: 'B 1234 CD' },
      date: '2025-05-05',
      timeWindow: { start: '09:00', end: '12:00' },
      status: 'pending',
      pickupRequests: [
        { id: 'PR007', code: 'PR-20250505-001', scheduledTime: '09:30', address: 'Jl. Sudirman No. 404, Jakarta', customer: 'PT Lancar Jaya' },
        { id: 'PR008', code: 'PR-20250505-002', scheduledTime: '10:30', address: 'Jl. Gatot Subroto No. 505, Jakarta', customer: 'CV Maju Mundur' },
      ]
    },
    {
      id: 'PA005',
      code: 'PA-20250505-002',
      team: { id: 'T2', name: 'Team Bravo' },
      vehicle: { id: 'V2', name: 'Mitsubishi L300', plateNumber: 'B 5678 EF' },
      date: '2025-05-06',
      timeWindow: { start: '13:00', end: '16:00' },
      status: 'pending',
      pickupRequests: [
        { id: 'PR009', code: 'PR-20250506-001', scheduledTime: '13:30', address: 'Jl. Thamrin No. 606, Jakarta', customer: 'PT Maju Kena' },
        { id: 'PR010', code: 'PR-20250506-002', scheduledTime: '14:30', address: 'Jl. Kuningan No. 707, Jakarta', customer: 'PT Mundur Kena' },
      ]
    },
  ];
};

// Mock data for teams
const fetchTeams = async () => {
  // In production, this would be an API call
  return [
    { id: 'T1', name: 'Team Alpha' },
    { id: 'T2', name: 'Team Bravo' },
    { id: 'T3', name: 'Team Charlie' },
    { id: 'T4', name: 'Team Delta' },
  ];
};

const PickupScheduleVisualization = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [viewMode, setViewMode] = useState('day'); // 'day', 'week', 'team'

  // Fetch data
  const { data: assignments = [], isLoading: isLoadingAssignments } = useQuery({
    queryKey: ['pickupAssignments'],
    queryFn: fetchPickupAssignments,
  });

  const { data: teams = [], isLoading: isLoadingTeams } = useQuery({
    queryKey: ['teams'],
    queryFn: fetchTeams,
  });

  // Generate week days
  const generateWeekDays = () => {
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Monday as start of week
    const days = [];
    
    for (let i = 0; i < 7; i++) {
      days.push(addDays(weekStart, i));
    }
    
    return days;
  };

  const weekDays = generateWeekDays();

  // Filter assignments based on selected date and team
  const filteredAssignments = assignments.filter(assignment => {
    const assignmentDate = parseISO(assignment.date);
    
    if (viewMode === 'day') {
      return isSameDay(assignmentDate, selectedDate) && 
             (selectedTeam === 'all' || assignment.team.id === selectedTeam);
    } else if (viewMode === 'week') {
      const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
      const weekEnd = addDays(weekStart, 6);
      
      return isWithinInterval(assignmentDate, { start: weekStart, end: weekEnd }) &&
             (selectedTeam === 'all' || assignment.team.id === selectedTeam);
    } else if (viewMode === 'team') {
      return selectedTeam === 'all' || assignment.team.id === selectedTeam;
    }
    
    return false;
  });

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Render day view
  const renderDayView = () => {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">
          {format(selectedDate, 'EEEE, d MMMM yyyy', { locale: id })}
        </h2>
        
        {filteredAssignments.length === 0 ? (
          <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-500">
            Tidak ada jadwal pickup untuk tanggal ini
          </div>
        ) : (
          filteredAssignments.map(assignment => (
            <div key={assignment.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{assignment.code}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {assignment.team.name}
                    </div>
                    <div className="flex items-center">
                      <Truck className="w-4 h-4 mr-1" />
                      {assignment.vehicle.name} ({assignment.vehicle.plateNumber})
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {assignment.timeWindow.start} - {assignment.timeWindow.end}
                    </div>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
                  {assignment.status === 'pending' && 'Menunggu'}
                  {assignment.status === 'in_progress' && 'Sedang Berjalan'}
                  {assignment.status === 'completed' && 'Selesai'}
                  {assignment.status === 'cancelled' && 'Dibatalkan'}
                </div>
              </div>
              
              <div className="divide-y divide-gray-100">
                {assignment.pickupRequests.map(request => (
                  <div key={request.id} className="p-4 hover:bg-gray-50">
                    <div className="flex justify-between">
                      <div className="font-medium">{request.code}</div>
                      <div className="text-sm text-gray-500">{request.scheduledTime}</div>
                    </div>
                    <div className="mt-1 text-sm text-gray-600">{request.customer}</div>
                    <div className="mt-1 text-sm text-gray-500 flex items-start">
                      <MapPin className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" />
                      <span>{request.address}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  // Render week view
  const renderWeekView = () => {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">
          {format(weekDays[0], 'd MMM', { locale: id })} - {format(weekDays[6], 'd MMM yyyy', { locale: id })}
        </h2>
        
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day, index) => (
            <div key={index} className="text-center">
              <div className="font-medium">{format(day, 'EEE', { locale: id })}</div>
              <div className={`text-sm rounded-full w-7 h-7 flex items-center justify-center mx-auto ${
                isSameDay(day, new Date()) ? 'bg-primary text-white' : ''
              }`}>
                {format(day, 'd')}
              </div>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-2 mt-2">
          {weekDays.map((day, index) => {
            const dayAssignments = assignments.filter(a => 
              isSameDay(parseISO(a.date), day) && 
              (selectedTeam === 'all' || a.team.id === selectedTeam)
            );
            
            return (
              <div key={index} className="min-h-[100px] border border-gray-200 rounded-lg p-2 bg-white">
                {dayAssignments.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-gray-400">
                    No pickups
                  </div>
                ) : (
                  <div className="space-y-2">
                    {dayAssignments.map(assignment => (
                      <div 
                        key={assignment.id} 
                        className={`p-2 rounded text-xs ${getStatusColor(assignment.status)} cursor-pointer`}
                      >
                        <div className="font-medium truncate">{assignment.team.name}</div>
                        <div className="truncate">{assignment.timeWindow.start}-{assignment.timeWindow.end}</div>
                        <div className="truncate">{assignment.pickupRequests.length} pickups</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render team view
  const renderTeamView = () => {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">
          Team Schedule Overview
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teams.map(team => {
            const teamAssignments = assignments.filter(a => a.team.id === team.id);
            
            return (
              <div key={team.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <h3 className="font-medium">{team.name}</h3>
                  <div className="text-sm text-gray-500 mt-1">
                    {teamAssignments.length} assignments scheduled
                  </div>
                </div>
                
                <div className="divide-y divide-gray-100">
                  {teamAssignments.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No assignments scheduled
                    </div>
                  ) : (
                    teamAssignments.map(assignment => (
                      <div key={assignment.id} className="p-4 hover:bg-gray-50">
                        <div className="flex justify-between">
                          <div className="font-medium">{assignment.code}</div>
                          <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
                            {assignment.status === 'pending' && 'Menunggu'}
                            {assignment.status === 'in_progress' && 'Sedang Berjalan'}
                            {assignment.status === 'completed' && 'Selesai'}
                            {assignment.status === 'cancelled' && 'Dibatalkan'}
                          </div>
                        </div>
                        <div className="mt-1 text-sm text-gray-600 flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {format(parseISO(assignment.date), 'EEEE, d MMMM yyyy', { locale: id })}
                        </div>
                        <div className="mt-1 text-sm text-gray-600 flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {assignment.timeWindow.start} - {assignment.timeWindow.end}
                        </div>
                        <div className="mt-1 text-sm text-gray-600 flex items-center">
                          <Package className="w-4 h-4 mr-1" />
                          {assignment.pickupRequests.length} pickup requests
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setViewMode('day')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md ${
              viewMode === 'day' 
                ? 'bg-primary text-white' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Day View
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md ${
              viewMode === 'week' 
                ? 'bg-primary text-white' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Week View
          </button>
          <button
            onClick={() => setViewMode('team')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md ${
              viewMode === 'team' 
                ? 'bg-primary text-white' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Team View
          </button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {viewMode !== 'team' && (
            <div className="relative">
              <input
                type="date"
                value={format(selectedDate, 'yyyy-MM-dd')}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-md"
              />
            </div>
          )}
          
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white"
          >
            <option value="all">All Teams</option>
            {teams.map(team => (
              <option key={team.id} value={team.id}>{team.name}</option>
            ))}
          </select>
        </div>
      </div>
      
      {isLoadingAssignments || isLoadingTeams ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div>
          {viewMode === 'day' && renderDayView()}
          {viewMode === 'week' && renderWeekView()}
          {viewMode === 'team' && renderTeamView()}
        </div>
      )}
    </div>
  );
};

export default PickupScheduleVisualization;
