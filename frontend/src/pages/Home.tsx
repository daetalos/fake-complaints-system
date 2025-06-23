import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Button,
  Paper,
  Divider
} from '@mui/material';
import { 
  LocalHospital, 
  Security, 
  Speed, 
  Assignment,
  Phone
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const FeatureCard = ({ 
  icon, 
  title, 
  description 
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <Card 
    elevation={0}
    sx={{ 
      height: '100%',
      border: '1px solid #e1e5e9',
      bgcolor: '#ffffff',
      '&:hover': {
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        transform: 'translateY(-1px)',
        transition: 'all 0.2s ease-in-out'
      }
    }}
  >
    <CardContent sx={{ p: 3, textAlign: 'center' }}>
             <Box 
         sx={{ 
           display: 'inline-flex',
           p: 2,
           borderRadius: '50%',
           bgcolor: '#f5f6fa',
           mb: 2
         }}
       >
         {React.cloneElement(icon as React.ReactElement<{ sx?: object }>, { 
           sx: { fontSize: 32, color: '#5c6bc0' }
         })}
       </Box>
      <Typography variant="h6" fontWeight="600" color="#263238" sx={{ mb: 1 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="#78909c" sx={{ lineHeight: 1.6 }}>
        {description}
      </Typography>
    </CardContent>
  </Card>
);

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ 
      bgcolor: '#f8f9fa',
      minHeight: '100vh'
    }}>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: '#ffffff',
          borderBottom: '1px solid #e1e5e9',
          py: 8
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', maxWidth: '800px', mx: 'auto' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <Box 
                sx={{ 
                  display: 'inline-flex',
                  p: 3,
                  borderRadius: '50%',
                  bgcolor: '#f5f6fa',
                  border: '1px solid #e1e5e9'
                }}
              >
                <LocalHospital sx={{ fontSize: 48, color: '#5c6bc0' }} />
              </Box>
            </Box>
            <Typography 
              variant="h2" 
              fontWeight="700" 
              color="#263238"
              sx={{ mb: 3, fontSize: { xs: '2.5rem', md: '3.5rem' } }}
            >
              Healthcare Management System
            </Typography>
            <Typography 
              variant="h5" 
              color="#78909c" 
              sx={{ mb: 4, fontWeight: 400, lineHeight: 1.5 }}
            >
              Streamlined patient care coordination for on-call medical professionals
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button 
                variant="contained" 
                size="large"
                onClick={() => navigate('/dashboard')}
                sx={{ 
                  px: 4, 
                  py: 1.5,
                  bgcolor: '#5c6bc0',
                  color: 'white',
                  fontWeight: '600',
                  borderRadius: 1,
                  '&:hover': { 
                    bgcolor: '#3f51b5',
                    boxShadow: '0 4px 12px rgba(92, 107, 192, 0.3)'
                  }
                }}
              >
                View Dashboard
              </Button>
              <Button 
                variant="outlined" 
                size="large"
                onClick={() => navigate('/complaints/new')}
                sx={{ 
                  px: 4, 
                  py: 1.5,
                  borderColor: '#5c6bc0',
                  color: '#5c6bc0',
                  fontWeight: '600',
                  borderRadius: 1,
                  '&:hover': { 
                    bgcolor: '#f5f6fa',
                    borderColor: '#3f51b5'
                  }
                }}
              >
                Submit Complaint
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography 
            variant="h3" 
            fontWeight="600" 
            color="#263238"
            sx={{ mb: 2 }}
          >
            System Features
          </Typography>
          <Typography variant="body1" color="#78909c" sx={{ fontSize: '1.125rem' }}>
            Comprehensive tools designed for efficient healthcare operations
          </Typography>
          <Divider sx={{ mt: 3, mb: 4, borderColor: '#e1e5e9', maxWidth: '200px', mx: 'auto' }} />
        </Box>

        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 4 }}>
            <FeatureCard
              icon={<Assignment />}
              title="Patient Management"
              description="Comprehensive patient tracking and case management with real-time status updates and priority handling."
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FeatureCard
              icon={<Security />}
              title="Secure & Compliant"
              description="HIPAA-compliant data handling with robust security measures to protect sensitive patient information."
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FeatureCard
              icon={<Speed />}
              title="Real-time Updates"
              description="Instant notifications and live dashboard updates to keep medical staff informed of critical changes."
            />
          </Grid>
        </Grid>

        {/* Quick Stats */}
        <Paper 
          elevation={0}
          sx={{ 
            mt: 8, 
            p: 4, 
            textAlign: 'center',
            border: '1px solid #e1e5e9',
            bgcolor: '#ffffff'
          }}
        >
          <Typography 
            variant="h4" 
            fontWeight="600" 
            color="#263238"
            sx={{ mb: 3 }}
          >
            System Overview
          </Typography>
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box>
                <Typography 
                  variant="h2" 
                  fontWeight="700" 
                  color="#5c6bc0"
                  sx={{ mb: 1, fontSize: '3rem' }}
                >
                  24/7
                </Typography>
                <Typography variant="body1" color="#78909c" fontWeight="500">
                  System Availability
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box>
                <Typography 
                  variant="h2" 
                  fontWeight="700" 
                  color="#4caf50"
                  sx={{ mb: 1, fontSize: '3rem' }}
                >
                  &lt;2s
                </Typography>
                <Typography variant="body1" color="#78909c" fontWeight="500">
                  Average Response Time
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box>
                <Typography 
                  variant="h2" 
                  fontWeight="700" 
                  color="#ff9800"
                  sx={{ mb: 1, fontSize: '3rem' }}
                >
                  99.9%
                </Typography>
                <Typography variant="body1" color="#78909c" fontWeight="500">
                  Uptime Guarantee
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Emergency Contact */}
        <Paper 
          elevation={0}
          sx={{ 
            mt: 6, 
            p: 4, 
            textAlign: 'center',
            border: '1px solid #e1e5e9',
            bgcolor: '#f8f9fa'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Phone sx={{ fontSize: 32, color: '#f44336' }} />
          </Box>
          <Typography 
            variant="h5" 
            fontWeight="600" 
            color="#263238"
            sx={{ mb: 1 }}
          >
            Emergency Support
          </Typography>
          <Typography variant="body1" color="#78909c" sx={{ mb: 2 }}>
            For urgent technical issues or system emergencies
          </Typography>
          <Typography 
            variant="h4" 
            fontWeight="700" 
            color="#f44336"
            sx={{ letterSpacing: 1 }}
          >
            1-800-SUPPORT
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default Home; 