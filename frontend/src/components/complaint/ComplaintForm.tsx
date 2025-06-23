import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  MenuItem,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Paper,
  Avatar,
  Autocomplete,
  Divider,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Chip
} from '@mui/material';
import {
  Assignment,
  Person,
  MedicalServices,
  Category,
  Description,
  CheckCircle,
  Error as ErrorIcon,
  Send
} from '@mui/icons-material';
import type { components } from '../../types/api';
import apiClient from '../../services/apiClient';

type ComplaintCategory = components['schemas']['ComplaintCategory'];
type SubCategory = components['schemas']['SubCategory'];
type PatientSummary = components['schemas']['PatientSummary'];
type CaseSummary = components['schemas']['CaseSummary'];

// Form validation schema
const validationSchema = yup.object({
  selectedMainCategory: yup.string().required('Please select a main category'),
  selectedSubCategory: yup.string().required('Please select a sub-category'),
  selectedPatient: yup.mixed<PatientSummary>().nullable().required('Please select a patient'),
  selectedCase: yup.string().required('Please select a case'),
  description: yup
    .string()
    .required('Please provide a description')
    .min(20, 'Description must be at least 20 characters')
    .max(1000, 'Description must not exceed 1000 characters'),
});

interface FormData {
  selectedMainCategory: string;
  selectedSubCategory: string;
  selectedPatient: PatientSummary | null;
  selectedCase: string;
  description: string;
}

const ComplaintForm: React.FC = () => {
  const [categories, setCategories] = useState<ComplaintCategory[]>([]);
  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [cases, setCases] = useState<CaseSummary[]>([]);
  const [patientQuery, setPatientQuery] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isValid }
  } = useForm<FormData>({
    resolver: yupResolver(validationSchema) as any,
    defaultValues: {
      selectedMainCategory: '',
      selectedSubCategory: '',
      selectedPatient: null,
      selectedCase: '',
      description: '',
    },
    mode: 'onChange'
  });

  const watchedMainCategory = watch('selectedMainCategory');
  const watchedPatient = watch('selectedPatient');

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/complaint-categories/');
        if (!response.ok) {
          throw new Error('Failed to fetch categories.');
        }
        const data: ComplaintCategory[] = await response.json();
        setCategories(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch categories');
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Fetch patients based on query
  useEffect(() => {
    const fetchPatients = async () => {
      if (patientQuery.length < 2) {
        setPatients([]);
        return;
      }
      
      try {
        const data = await apiClient.getPatients(patientQuery);
        setPatients(data);
      } catch (err) {
        console.error('Failed to fetch patients:', err);
        setPatients([]);
      }
    };
    
    const timeoutId = setTimeout(fetchPatients, 300); // Debounce
    return () => clearTimeout(timeoutId);
  }, [patientQuery]);

  // Fetch cases when patient is selected
  useEffect(() => {
    if (watchedPatient) {
      const fetchCases = async () => {
        try {
          setLoading(true);
          const data = await apiClient.getCases(watchedPatient.patient_id);
          setCases(data);
        } catch (err) {
          setError('Failed to fetch cases for selected patient');
          setCases([]);
        } finally {
          setLoading(false);
        }
      };
      fetchCases();
    } else {
      setCases([]);
    }
  }, [watchedPatient]);

  const subCategoryOptions = watchedMainCategory
    ? categories.find(c => c.main_category === watchedMainCategory)?.sub_categories || []
    : [];

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        description: data.description,
        category_id: data.selectedSubCategory,
        patient_id: data.selectedPatient!.patient_id,
        case_id: data.selectedCase,
      };
      
      const response = await apiClient.createComplaint(payload);
      setSuccess(`Complaint submitted successfully! Reference ID: ${response.complaint_id}`);
      
      // Reset form
      reset();
      setPatientQuery('');
      setCases([]);
      setPatients([]);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit complaint. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <Box sx={{ p: 4 }}>
        <Paper 
          elevation={0}
          sx={{ 
            p: 4, 
            textAlign: 'center',
            border: '1px solid #e8f5e8',
            bgcolor: '#f1f8e9',
            borderRadius: 1
          }}
        >
          <CheckCircle sx={{ fontSize: 64, color: '#4caf50', mb: 2 }} />
          <Typography variant="h5" fontWeight="600" color="#263238" sx={{ mb: 2 }}>
            Complaint Submitted Successfully
          </Typography>
          <Typography variant="body1" color="#78909c" sx={{ mb: 3 }}>
            {success}
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => setSuccess('')}
            sx={{ 
              bgcolor: '#4caf50',
              '&:hover': { bgcolor: '#388e3c' }
            }}
          >
            Submit Another Complaint
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Assignment sx={{ color: '#5c6bc0', fontSize: 28 }} />
          <Typography variant="h5" fontWeight="600" color="#263238">
            Complaint Details
          </Typography>
        </Box>
        <Typography variant="body1" color="#78909c">
          Please provide complete information to help us investigate and resolve your concern effectively.
        </Typography>
        <Divider sx={{ mt: 2, borderColor: '#e1e5e9' }} />
      </Box>

      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={4}>
          
          {/* Category Selection Section */}
          <Grid size={12}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 3, 
                border: '1px solid #e1e5e9',
                bgcolor: '#ffffff',
                borderRadius: 1
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Category sx={{ color: '#5c6bc0', fontSize: 24 }} />
                <Typography variant="h6" fontWeight="600" color="#263238">
                  Complaint Category
                </Typography>
              </Box>
              
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Controller
                    name="selectedMainCategory"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.selectedMainCategory}>
                        <InputLabel>Main Category</InputLabel>
                        <Select
                          {...field}
                          label="Main Category"
                          disabled={loading}
                        >
                          {categories.map((category) => (
                            <MenuItem key={category.main_category} value={category.main_category}>
                              {category.main_category}
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.selectedMainCategory && (
                          <FormHelperText>{errors.selectedMainCategory.message}</FormHelperText>
                        )}
                      </FormControl>
                    )}
                  />
                </Grid>
                
                <Grid size={{ xs: 12, md: 6 }}>
                  <Controller
                    name="selectedSubCategory"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.selectedSubCategory}>
                        <InputLabel>Sub-Category</InputLabel>
                        <Select
                          {...field}
                          label="Sub-Category"
                          disabled={!watchedMainCategory || subCategoryOptions.length === 0}
                                                 >
                           {subCategoryOptions.map((subCat) => (
                             <MenuItem key={subCat.category_id} value={subCat.category_id}>
                               {subCat.sub_category}
                             </MenuItem>
                           ))}
                         </Select>
                        {errors.selectedSubCategory && (
                          <FormHelperText>{errors.selectedSubCategory.message}</FormHelperText>
                        )}
                      </FormControl>
                    )}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Patient & Case Selection Section */}
          <Grid size={12}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 3, 
                border: '1px solid #e1e5e9',
                bgcolor: '#ffffff',
                borderRadius: 1
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Person sx={{ color: '#5c6bc0', fontSize: 24 }} />
                <Typography variant="h6" fontWeight="600" color="#263238">
                  Patient & Case Information
                </Typography>
              </Box>
              
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Controller
                    name="selectedPatient"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <Autocomplete
                        value={value}
                        onChange={(_, newValue) => onChange(newValue)}
                        onInputChange={(_, newInputValue) => setPatientQuery(newInputValue)}
                        options={patients}
                                                 getOptionLabel={(option) => `${option.name} (ID: ${option.patient_id})`}
                         renderOption={(props, option) => (
                           <Box component="li" {...props}>
                             <Avatar sx={{ mr: 2, bgcolor: '#f5f6fa', color: '#5c6bc0', width: 32, height: 32 }}>
                               {option.name.charAt(0)}
                             </Avatar>
                             <Box>
                               <Typography variant="body2" fontWeight="500">
                                 {option.name}
                               </Typography>
                               <Typography variant="caption" color="#78909c">
                                 ID: {option.patient_id} • DOB: {option.dob}
                               </Typography>
                             </Box>
                           </Box>
                         )}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Search Patient"
                            placeholder="Type patient name or ID..."
                            error={!!errors.selectedPatient}
                            helperText={errors.selectedPatient?.message}
                            InputProps={{
                              ...params.InputProps,
                              endAdornment: (
                                <>
                                  {loading && <CircularProgress color="inherit" size={20} />}
                                  {params.InputProps.endAdornment}
                                </>
                              ),
                            }}
                          />
                        )}
                        loading={loading}
                        loadingText="Searching patients..."
                        noOptionsText={patientQuery.length < 2 ? "Type at least 2 characters to search" : "No patients found"}
                      />
                    )}
                  />
                </Grid>
                
                <Grid size={{ xs: 12, md: 6 }}>
                  <Controller
                    name="selectedCase"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.selectedCase}>
                        <InputLabel>Associated Case</InputLabel>
                        <Select
                          {...field}
                          label="Associated Case"
                          disabled={!watchedPatient || cases.length === 0}
                                                 >
                           {cases.map((caseItem) => (
                             <MenuItem key={caseItem.case_id} value={caseItem.case_id}>
                               <Box>
                                 <Typography variant="body2" fontWeight="500">
                                   Case #{caseItem.case_id}
                                 </Typography>
                                 <Typography variant="caption" color="#78909c">
                                   {caseItem.case_reference}
                                 </Typography>
                               </Box>
                             </MenuItem>
                           ))}
                         </Select>
                        {errors.selectedCase && (
                          <FormHelperText>{errors.selectedCase.message}</FormHelperText>
                        )}
                        {watchedPatient && cases.length === 0 && !loading && (
                          <FormHelperText>No cases found for selected patient</FormHelperText>
                        )}
                      </FormControl>
                    )}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Description Section */}
          <Grid size={12}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 3, 
                border: '1px solid #e1e5e9',
                bgcolor: '#ffffff',
                borderRadius: 1
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Description sx={{ color: '#5c6bc0', fontSize: 24 }} />
                <Typography variant="h6" fontWeight="600" color="#263238">
                  Complaint Description
                </Typography>
              </Box>
              
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    multiline
                    rows={6}
                    fullWidth
                    label="Detailed Description"
                    placeholder="Please provide a detailed description of the incident or concern. Include relevant dates, times, locations, and any other pertinent information that will help us investigate and resolve the matter."
                    error={!!errors.description}
                    helperText={
                      errors.description?.message || 
                      `${field.value.length}/1000 characters`
                    }
                    inputProps={{ maxLength: 1000 }}
                  />
                )}
              />
            </Paper>
          </Grid>

          {/* Submit Section */}
          <Grid size={12}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 3, 
                border: '1px solid #e1e5e9',
                bgcolor: '#f8f9fa',
                borderRadius: 1
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="#546e7a" sx={{ mb: 1 }}>
                    Review your information before submitting
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip 
                      label="Confidential" 
                      size="small" 
                      sx={{ bgcolor: '#e3f2fd', color: '#1565c0' }}
                    />
                    <Chip 
                      label="24hr Response" 
                      size="small" 
                      sx={{ bgcolor: '#e8f5e8', color: '#2e7d32' }}
                    />
                  </Box>
                </Box>
                
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={!isValid || submitting}
                  startIcon={submitting ? <CircularProgress size={20} /> : <Send />}
                  sx={{
                    bgcolor: '#5c6bc0',
                    px: 4,
                    py: 1.5,
                    fontWeight: '600',
                    '&:hover': { bgcolor: '#3f51b5' },
                    '&:disabled': { bgcolor: '#e0e0e0' }
                  }}
                >
                  {submitting ? 'Submitting...' : 'Submit Complaint'}
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default ComplaintForm; 