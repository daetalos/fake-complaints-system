import React from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Paper, 
  Grid, 
  Chip,
  Avatar,
  Divider
} from '@mui/material';
import { 
  LocalHospital,
  People,
  Warning,
  AccessTime,
  Assignment
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';

const mockRows = [
  { 
    id: 1, 
    name: 'John Doe', 
    status: 'Waiting', 
    urgency: 'High',
    room: 'ER-101',
    waitTime: '45 min',
    complaint: 'Chest pain'
  },
  { 
    id: 2, 
    name: 'Jane Smith', 
    status: 'In Progress', 
    urgency: 'Medium',
    room: 'ER-203',
    waitTime: '15 min',
    complaint: 'Fever and headache'
  },
  { 
    id: 3, 
    name: 'Alice Johnson', 
    status: 'Completed', 
    urgency: 'Low',
    room: 'ER-105',
    waitTime: '0 min',
    complaint: 'Minor cut'
  },
];

const getUrgencyColor = (urgency: string) => {
  switch (urgency) {
    case 'High': return '#d32f2f';
    case 'Medium': return '#f57c00';
    case 'Low': return '#388e3c';
    default: return '#757575';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Waiting': return '#f57c00';
    case 'In Progress': return '#1976d2';
    case 'Completed': return '#388e3c';
    default: return '#757575';
  }
};

const columns: GridColDef[] = [
  { 
    field: 'name', 
    headerName: 'Patient Name', 
    flex: 1,
    renderCell: (params: GridRenderCellParams) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Avatar sx={{ width: 32, height: 32, bgcolor: '#90a4ae', fontSize: '0.875rem', color: 'white' }}>
          {params.value.split(' ').map((n: string) => n[0]).join('')}
        </Avatar>
        <Typography variant="body2" fontWeight="500" color="#37474f">
          {params.value}
        </Typography>
      </Box>
    )
  },
  { 
    field: 'complaint', 
    headerName: 'Chief Complaint', 
    flex: 1.2,
    renderCell: (params: GridRenderCellParams) => (
      <Typography variant="body2" color="#78909c">
        {params.value}
      </Typography>
    )
  },
  { 
    field: 'room', 
    headerName: 'Room', 
    width: 100,
    renderCell: (params: GridRenderCellParams) => (
      <Chip 
        label={params.value} 
        size="small" 
        variant="outlined"
        sx={{ 
          fontWeight: '500',
          borderColor: '#cfd8dc',
          color: '#546e7a',
          bgcolor: '#f8f9fa'
        }}
      />
    )
  },
  { 
    field: 'status', 
    headerName: 'Status', 
    width: 120,
    renderCell: (params: GridRenderCellParams) => (
      <Chip 
        label={params.value}
        size="small"
        sx={{ 
          bgcolor: getStatusColor(params.value),
          color: 'white',
          fontWeight: '500',
          fontSize: '0.75rem'
        }}
      />
    )
  },
  { 
    field: 'urgency', 
    headerName: 'Priority', 
    width: 100,
    renderCell: (params: GridRenderCellParams) => (
      <Chip 
        label={params.value}
        size="small"
        sx={{
          bgcolor: getUrgencyColor(params.value),
          color: 'white',
          fontWeight: '500',
          fontSize: '0.75rem'
        }}
      />
    )
  },
  { 
    field: 'waitTime', 
    headerName: 'Wait Time', 
    width: 100,
    renderCell: (params: GridRenderCellParams) => (
      <Typography 
        variant="body2" 
        color={params.value === '0 min' ? '#388e3c' : '#78909c'}
        fontWeight="500"
      >
        {params.value}
      </Typography>
    )
  },
];

const StatCard = ({ 
  title, 
  value, 
  icon, 
  color, 
  subtitle 
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}) => (
  <Card 
    elevation={0}
    sx={{ 
      height: '100%',
      border: '1px solid #e1e5e9',
      bgcolor: '#ffffff',
      '&:hover': {
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
      }
    }}
  >
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Avatar sx={{ bgcolor: color, width: 40, height: 40 }}>
          {icon}
        </Avatar>
      </Box>
      <Typography variant="h3" fontWeight="600" color={color} sx={{ mb: 0.5, fontSize: '2rem' }}>
        {value}
      </Typography>
      <Typography variant="body1" color="#37474f" fontWeight="500" sx={{ mb: 0.5 }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="body2" color="#78909c" sx={{ fontSize: '0.875rem' }}>
          {subtitle}
        </Typography>
      )}
    </CardContent>
  </Card>
);

const Dashboard: React.FC = () => {
  return (
    <Box sx={{ 
      p: 3,
      bgcolor: '#f8f9fa',
      minHeight: '100vh'
    }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h4" 
          fontWeight="600" 
          color="#263238"
          sx={{ mb: 1 }}
        >
          On-Call Dashboard
        </Typography>
        <Typography variant="body1" color="#78909c" sx={{ fontSize: '1rem' }}>
          Real-time overview of emergency department operations
        </Typography>
        <Divider sx={{ mt: 2, mb: 3, borderColor: '#e1e5e9' }} />
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Active Cases"
            value={12}
            icon={<LocalHospital sx={{ fontSize: 20 }} />}
            color="#5c6bc0"
            subtitle="Currently being treated"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Patients Waiting"
            value={5}
            icon={<People sx={{ fontSize: 20 }} />}
            color="#ff9800"
            subtitle="In queue for treatment"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Urgent Cases"
            value={3}
            icon={<Warning sx={{ fontSize: 20 }} />}
            color="#f44336"
            subtitle="Require immediate attention"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Avg Wait Time"
            value="22 min"
            icon={<AccessTime sx={{ fontSize: 20 }} />}
            color="#4caf50"
            subtitle="Target: < 30 min"
          />
        </Grid>
      </Grid>

      {/* Patient Queue Section */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <Paper 
            elevation={0}
            sx={{ 
              borderRadius: 1,
              overflow: 'hidden',
              border: '1px solid #e1e5e9',
              bgcolor: '#ffffff'
            }}
          >
            <Box sx={{ 
              p: 3, 
              bgcolor: '#f5f6fa',
              borderBottom: '1px solid #e1e5e9'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Assignment sx={{ color: '#546e7a', fontSize: 24 }} />
                <Typography variant="h6" fontWeight="600" color="#263238">
                  Patient Queue
                </Typography>
              </Box>
              <Typography variant="body2" color="#78909c" sx={{ mt: 1 }}>
                Monitor and manage patient flow in real-time
              </Typography>
            </Box>
            <Box sx={{ p: 0 }}>
              <DataGrid
                rows={mockRows}
                columns={columns}
                pageSizeOptions={[5, 10, 25]}
                initialState={{
                  pagination: { paginationModel: { pageSize: 5, page: 0 } },
                }}
                disableRowSelectionOnClick
                autoHeight
                sx={{
                  border: 'none',
                  '& .MuiDataGrid-cell': {
                    borderBottom: '1px solid #f0f4f8',
                    color: '#37474f',
                    fontSize: '0.875rem'
                  },
                  '& .MuiDataGrid-columnHeaders': {
                    backgroundColor: '#f8f9fa',
                    fontWeight: '600',
                    borderBottom: '1px solid #e1e5e9',
                    color: '#546e7a',
                    fontSize: '0.875rem'
                  },
                  '& .MuiDataGrid-row:hover': {
                    backgroundColor: '#f8f9fa',
                  },
                  '& .MuiDataGrid-footerContainer': {
                    borderTop: '1px solid #e1e5e9',
                    backgroundColor: '#f8f9fa'
                  }
                }}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 