import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Breadcrumbs, 
  Link, 
  Paper,
  Grid,
  Divider,
  Chip
} from '@mui/material';
import { 
  NavigateNext, 
  Assignment, 
  AccessTime, 
  Security, 
  Support,
  Phone,
  Email
} from '@mui/icons-material';
import ComplaintForm from '../components/complaint/ComplaintForm';

const InfoCard = ({ 
  icon, 
  title, 
  description, 
  color 
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}) => (
  <Paper 
    elevation={0}
    sx={{ 
      p: 3, 
      height: '100%',
      border: '1px solid #e1e5e9',
      bgcolor: '#ffffff',
      borderRadius: 1,
      '&:hover': {
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
      }
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
      <Box 
        sx={{ 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 40,
          height: 40,
          borderRadius: '50%',
          bgcolor: '#f5f6fa'
        }}
      >
        {React.cloneElement(icon as React.ReactElement<{ sx?: object }>, { 
          sx: { fontSize: 20, color }
        })}
      </Box>
      <Typography variant="h6" fontWeight="600" color="#263238">
        {title}
      </Typography>
    </Box>
    <Typography variant="body2" color="#78909c" sx={{ lineHeight: 1.6 }}>
      {description}
    </Typography>
  </Paper>
);

const NewComplaintPage: React.FC = () => {
  return (
    <Box sx={{ 
      bgcolor: '#f8f9fa',
      minHeight: '100vh'
    }}>
      {/* Header Section */}
      <Box sx={{ 
        bgcolor: '#ffffff',
        borderBottom: '1px solid #e1e5e9',
        py: 4
      }}>
        <Container maxWidth="lg">
          {/* Breadcrumbs */}
          <Breadcrumbs 
            separator={<NavigateNext fontSize="small" />}
            sx={{ mb: 2 }}
          >
            <Link 
              underline="hover" 
              color="#78909c" 
              href="/"
              sx={{ 
                fontWeight: '500',
                '&:hover': { color: '#5c6bc0' }
              }}
            >
              Home
            </Link>
            <Typography color="#546e7a" fontWeight="500">
              New Complaint
            </Typography>
          </Breadcrumbs>

          {/* Page Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Box 
              sx={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 48,
                height: 48,
                borderRadius: '50%',
                bgcolor: '#f5f6fa',
                border: '1px solid #e1e5e9'
              }}
            >
              <Assignment sx={{ fontSize: 24, color: '#5c6bc0' }} />
            </Box>
            <Box>
              <Typography 
                variant="h4" 
                fontWeight="700" 
                color="#263238"
                sx={{ mb: 0.5 }}
              >
                Submit New Complaint
              </Typography>
              <Typography variant="body1" color="#78909c">
                Report incidents and concerns for quality improvement
              </Typography>
            </Box>
          </Box>

          {/* Service Level Information */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Chip 
              icon={<AccessTime sx={{ fontSize: 16 }} />}
              label="Response within 24 hours"
              size="small"
              sx={{ 
                bgcolor: '#e8f5e8',
                color: '#2e7d32',
                fontWeight: '500',
                '& .MuiChip-icon': { color: '#2e7d32' }
              }}
            />
            <Chip 
              icon={<Security sx={{ fontSize: 16 }} />}
              label="Confidential & Secure"
              size="small"
              sx={{ 
                bgcolor: '#e3f2fd',
                color: '#1565c0',
                fontWeight: '500',
                '& .MuiChip-icon': { color: '#1565c0' }
              }}
            />
            <Chip 
              icon={<Support sx={{ fontSize: 16 }} />}
              label="Full Investigation"
              size="small"
              sx={{ 
                bgcolor: '#fff3e0',
                color: '#ef6c00',
                fontWeight: '500',
                '& .MuiChip-icon': { color: '#ef6c00' }
              }}
            />
          </Box>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          {/* Complaint Form */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 0,
                border: '1px solid #e1e5e9',
                bgcolor: '#ffffff',
                borderRadius: 1,
                overflow: 'hidden'
              }}
            >
              <ComplaintForm />
            </Paper>
          </Grid>

          {/* Help & Information Sidebar */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              
              {/* Process Information */}
              <Box>
                <Typography 
                  variant="h6" 
                  fontWeight="600" 
                  color="#263238"
                  sx={{ mb: 2 }}
                >
                  Complaint Process
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={12}>
                    <InfoCard
                      icon={<AccessTime />}
                      title="Quick Response"
                      description="All complaints are acknowledged within 24 hours and investigated thoroughly."
                      color="#4caf50"
                    />
                  </Grid>
                  <Grid size={12}>
                    <InfoCard
                      icon={<Security />}
                      title="Confidentiality"
                      description="Your privacy is protected. Reports can be submitted anonymously if preferred."
                      color="#5c6bc0"
                    />
                  </Grid>
                  <Grid size={12}>
                    <InfoCard
                      icon={<Support />}
                      title="Follow-up"
                      description="You'll receive updates on the investigation progress and final resolution."
                      color="#ff9800"
                    />
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ borderColor: '#e1e5e9' }} />

              {/* Emergency Contact */}
              <Paper 
                elevation={0}
                sx={{ 
                  p: 3,
                  border: '1px solid #e1e5e9',
                  bgcolor: '#fef7f0',
                  borderRadius: 1
                }}
              >
                <Typography 
                  variant="h6" 
                  fontWeight="600" 
                  color="#263238"
                  sx={{ mb: 2 }}
                >
                  Need Immediate Help?
                </Typography>
                <Typography variant="body2" color="#78909c" sx={{ mb: 3 }}>
                  For urgent safety concerns or emergencies, contact us directly:
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Phone sx={{ color: '#f44336', fontSize: 20 }} />
                    <Box>
                      <Typography variant="body2" fontWeight="600" color="#263238">
                        Emergency Hotline
                      </Typography>
                      <Typography variant="body2" color="#f44336" fontWeight="600">
                        1-800-URGENT
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Email sx={{ color: '#5c6bc0', fontSize: 20 }} />
                    <Box>
                      <Typography variant="body2" fontWeight="600" color="#263238">
                        Quality Assurance
                      </Typography>
                      <Typography variant="body2" color="#5c6bc0" fontWeight="600">
                        qa@spectrum.health
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default NewComplaintPage; 