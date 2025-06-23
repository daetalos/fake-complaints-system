import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  Button,
  Card,
  CardContent,
  CardHeader,
  Avatar
} from '@mui/material';
import Assignment from '@mui/icons-material/Assignment';
import Person from '@mui/icons-material/Person';
import Home from '@mui/icons-material/Home';
import Email from '@mui/icons-material/Email';
import Phone from '@mui/icons-material/Phone';
import Category from '@mui/icons-material/Category';
import MedicalServices from '@mui/icons-material/MedicalServices';
import CalendarToday from '@mui/icons-material/CalendarToday';
import ArrowBack from '@mui/icons-material/ArrowBack';
import type { components } from '../types/api';
import apiClient from '../services/apiClient';

type Complaint = components['schemas']['Complaint'];

const ComplaintDetailsPage: React.FC = () => {
  const { complaintId } = useParams<{ complaintId: string }>();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchComplaint = async () => {
      if (!complaintId) {
        setError('No complaint ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await apiClient.getComplaint(complaintId);
        setComplaint(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch complaint details');
      } finally {
        setLoading(false);
      }
    };

    fetchComplaint();
  }, [complaintId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button 
          startIcon={<ArrowBack />} 
          onClick={() => navigate(-1)}
        >
          Go Back
        </Button>
      </Box>
    );
  }

  if (!complaint) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Complaint not found
        </Alert>
        <Button 
          startIcon={<ArrowBack />} 
          onClick={() => navigate(-1)}
        >
          Go Back
        </Button>
      </Box>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button 
          startIcon={<ArrowBack />} 
          onClick={() => navigate(-1)}
          sx={{ mb: 2 }}
        >
          Back to Complaints
        </Button>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Assignment sx={{ color: '#5c6bc0', fontSize: 28 }} />
          <Typography variant="h4" fontWeight="600" color="#263238">
            Complaint Details
          </Typography>
        </Box>
        
        <Typography variant="body1" color="#78909c">
          Reference ID: {complaint.complaint_id}
        </Typography>
        
        <Divider sx={{ mt: 2, borderColor: '#e1e5e9' }} />
      </Box>

      <Grid container spacing={4}>
        {/* Complainant Information */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={0} sx={{ border: '1px solid #e1e5e9', height: '100%' }}>
            <CardHeader
              avatar={
                <Avatar sx={{ bgcolor: '#5c6bc0' }}>
                  <Person />
                </Avatar>
              }
              title="Complainant Information"
              titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
            />
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Name
                  </Typography>
                  <Typography variant="body1">
                    {complaint.complainant?.name || 'Not available'}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Email
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Email sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body1">
                      {complaint.complainant?.email || 'Not available'}
                    </Typography>
                  </Box>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Address
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <Home sx={{ fontSize: 16, color: 'text.secondary', mt: 0.5 }} />
                    <Box>
                      {complaint.complainant ? (
                        <>
                          <Typography variant="body1">
                            {complaint.complainant.address_line1}
                          </Typography>
                          {complaint.complainant.address_line2 && (
                            <Typography variant="body1">
                              {complaint.complainant.address_line2}
                            </Typography>
                          )}
                          <Typography variant="body1">
                            {complaint.complainant.city} {complaint.complainant.postcode}
                          </Typography>
                        </>
                      ) : (
                        <Typography variant="body1" color="text.secondary">
                          Address not available
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Complaint Information */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card elevation={0} sx={{ border: '1px solid #e1e5e9', height: '100%' }}>
            <CardHeader
              avatar={
                <Avatar sx={{ bgcolor: '#ff7043' }}>
                  <Assignment />
                </Avatar>
              }
              title="Complaint Information"
              titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
            />
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                 <Box>
                   <Typography variant="subtitle2" color="primary" gutterBottom>
                     Category ID
                   </Typography>
                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                     <Category sx={{ fontSize: 16, color: 'text.secondary' }} />
                     <Chip 
                       label={complaint.category_id || 'Not specified'} 
                       color="primary" 
                       variant="outlined" 
                       size="small"
                     />
                   </Box>
                 </Box>

                <Box>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Patient
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MedicalServices sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body1">
                      {complaint.patient?.name || 'Not specified'}
                    </Typography>
                  </Box>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Case Reference
                  </Typography>
                  <Typography variant="body1">
                    {complaint.case?.case_reference || 'Not specified'}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Submitted
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body1">
                      {formatDate(complaint.created_at)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Description */}
        <Grid size={12}>
          <Card elevation={0} sx={{ border: '1px solid #e1e5e9' }}>
            <CardHeader
              avatar={
                <Avatar sx={{ bgcolor: '#66bb6a' }}>
                  <Assignment />
                </Avatar>
              }
              title="Complaint Description"
              titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
            />
            <CardContent>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  bgcolor: '#f8f9fa', 
                  border: '1px solid #e1e5e9',
                  borderRadius: 1
                }}
              >
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                  {complaint.description}
                </Typography>
              </Paper>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ComplaintDetailsPage; 