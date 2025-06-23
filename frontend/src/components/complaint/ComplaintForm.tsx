import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
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
  Chip,
  Stepper,
  Step,
  StepLabel,
  StepContent
} from '@mui/material';
import Assignment from '@mui/icons-material/Assignment';
import Person from '@mui/icons-material/Person';
import Category from '@mui/icons-material/Category';
import Description from '@mui/icons-material/Description';
import CheckCircle from '@mui/icons-material/CheckCircle';
import Home from '@mui/icons-material/Home';
import Email from '@mui/icons-material/Email';
import Phone from '@mui/icons-material/Phone';
import type { components } from '../../types/api';
import apiClient from '../../services/apiClient';

type ComplaintCategory = components['schemas']['ComplaintCategory'];
type PatientSummary = components['schemas']['PatientSummary'];
type CaseSummary = components['schemas']['CaseSummary'];
type ComplainantCreate = components['schemas']['ComplainantCreate'];
type ComplainantSummary = components['schemas']['ComplainantSummary'];

// Form validation schema - now includes complainant data
const validationSchema = yup.object({
  // Complainant information
  complainantName: yup
    .string()
    .required('Complainant name is required')
    .min(2, 'Name must be at least 2 characters'),
  complainantEmail: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address'),
  complainantPhone: yup
    .string()
    .nullable()
    .notRequired(),
  addressLine1: yup
    .string()
    .required('Address line 1 is required')
    .min(5, 'Address must be at least 5 characters'),
  addressLine2: yup
    .string()
    .nullable()
    .notRequired(),
  city: yup
    .string()
    .required('City is required')
    .min(2, 'City must be at least 2 characters'),
  postcode: yup
    .string()
    .required('Postcode is required')
    .min(3, 'Postcode must be at least 3 characters'),
  
  // Existing complaint fields
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
  // Complainant data
  complainantName: string;
  complainantEmail: string;
  complainantPhone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  postcode: string;
  
  // Complaint data
  selectedMainCategory: string;
  selectedSubCategory: string;
  selectedPatient: PatientSummary | null;
  selectedCase: string;
  description: string;
}

const steps = [
  {
    label: 'Complainant Information',
    description: 'Provide complainant details and address',
  },
  {
    label: 'Complaint Details',
    description: 'Select category, patient, case and describe the issue',
  },
  {
    label: 'Review & Submit',
    description: 'Review all information before submitting',
  },
];

const ComplaintForm: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [categories, setCategories] = useState<ComplaintCategory[]>([]);
  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [cases, setCases] = useState<CaseSummary[]>([]);
  const [complainants, setComplainants] = useState<ComplainantSummary[]>([]);
  const [patientQuery, setPatientQuery] = useState('');
  const [complainantQuery, setComplainantQuery] = useState('');
  const [selectedComplainant, setSelectedComplainant] = useState<ComplainantSummary | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    trigger,
    formState: { errors }
  } = useForm<FormData>({
    resolver: yupResolver(validationSchema) as any,
    defaultValues: {
      complainantName: '',
      complainantEmail: '',
      complainantPhone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      postcode: '',
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

  // Fetch complainants based on query
  useEffect(() => {
    const fetchComplainants = async () => {
      if (complainantQuery.length < 2) {
        setComplainants([]);
        return;
      }
      
      try {
        const data = await apiClient.getComplainants(complainantQuery);
        setComplainants(data);
      } catch (error) {
        console.error('Failed to fetch complainants:', error);
        setComplainants([]);
      }
    };
    
    const timeoutId = setTimeout(fetchComplainants, 300); // Debounce
    return () => clearTimeout(timeoutId);
  }, [complainantQuery]);

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

  // Handle existing complainant selection
  const handleComplainantSelection = (complainant: ComplainantSummary | null) => {
    setSelectedComplainant(complainant);
    if (complainant) {
      setValue('complainantName', complainant.name);
      setValue('complainantEmail', complainant.email);
      setValue('addressLine1', complainant.address_line1);
      setValue('addressLine2', complainant.address_line2 || '');
      setValue('city', complainant.city);
      setValue('postcode', complainant.postcode);
      trigger(['complainantName', 'complainantEmail', 'addressLine1', 'city', 'postcode']);
    }
  };

  const subCategoryOptions = watchedMainCategory
    ? categories.find(c => c.main_category === watchedMainCategory)?.sub_categories || []
    : [];

  const handleNext = async () => {
    let fieldsToValidate: (keyof FormData)[] = [];
    
    if (activeStep === 0) {
      fieldsToValidate = ['complainantName', 'complainantEmail', 'addressLine1', 'city', 'postcode'];
    } else if (activeStep === 1) {
      fieldsToValidate = ['selectedMainCategory', 'selectedSubCategory', 'selectedPatient', 'selectedCase', 'description'];
    }
    
    const isStepValid = await trigger(fieldsToValidate);
    if (isStepValid) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const onSubmit = async (data: FormData) => {
    console.log('ComplaintForm: Starting complaint submission', {
      hasExistingComplainant: !!selectedComplainant,
      complainantName: data.complainantName,
      category: data.selectedSubCategory,
      patient: data.selectedPatient?.name
    });
    
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      let complainantId: string;
      
      // Create or use existing complainant
      if (selectedComplainant) {
        complainantId = selectedComplainant.complainant_id;
      } else {
        const complainantData: ComplainantCreate = {
          name: data.complainantName,
          email: data.complainantEmail,
          phone: data.complainantPhone || null,
          address_line1: data.addressLine1,
          address_line2: data.addressLine2 || null,
          city: data.city,
          postcode: data.postcode,
        };
        
        const newComplainant = await apiClient.createComplainant(complainantData);
        complainantId = newComplainant.complainant_id;
      }
      
      const payload = {
        description: data.description,
        category_id: data.selectedSubCategory,
        complainant_id: complainantId,
        patient_id: data.selectedPatient!.patient_id,
        case_id: data.selectedCase,
      };
      
      const response = await apiClient.createComplaint(payload);
      console.log('ComplaintForm: Complaint submitted successfully', {
        complaintId: response.complaint_id,
        complainantId: complainantId
      });
      setSuccess(`Complaint submitted successfully! Reference ID: ${response.complaint_id}`);
      
      // Reset form
      reset();
      setPatientQuery('');
      setComplainantQuery('');
      setCases([]);
      setPatients([]);
      setComplainants([]);
      setSelectedComplainant(null);
      setActiveStep(0);
      
    } catch (err) {
      console.error('ComplaintForm: Error submitting complaint', {
        error: err instanceof Error ? err.message : 'Unknown error',
        complainantName: data.complainantName,
        category: data.selectedSubCategory
      });
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
            backgroundColor: '#f8fdf8',
            borderRadius: 2
          }}
        >
          <CheckCircle sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom color="success.main">
            Complaint Submitted Successfully!
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {success}
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => {
              setSuccess('');
              setActiveStep(0);
            }}
            startIcon={<Assignment />}
          >
            Submit Another Complaint
          </Button>
        </Paper>
      </Box>
    );
  }

  const renderComplainantStep = () => (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Home color="primary" />
        Complainant Information
      </Typography>
      
      {/* Existing Complainant Search */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Search for existing complainant (optional)
        </Typography>
        <Autocomplete
          options={complainants}
          getOptionLabel={(option) => `${option.name} (${option.email})`}
          value={selectedComplainant}
          onChange={(_, newValue) => handleComplainantSelection(newValue)}
          onInputChange={(_, newValue) => setComplainantQuery(newValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Type name or email to search existing complainants..."
              variant="outlined"
              size="small"
            />
          )}
          renderOption={(props, option) => (
            <Box component="li" {...props}>
              <Box>
                <Typography variant="body2" fontWeight="medium">
                  {option.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {option.email} • {option.address_line1}, {option.city} {option.postcode}
                </Typography>
              </Box>
            </Box>
          )}
          noOptionsText="No complainants found"
        />
        {selectedComplainant && (
          <Alert severity="info" sx={{ mt: 1 }}>
            Using existing complainant: {selectedComplainant.name}
          </Alert>
        )}
      </Box>

      <Divider sx={{ my: 2 }} />

             <Grid container spacing={3}>
         <Grid
           size={{
             xs: 12,
             md: 6
           }}>
          <Controller
            name="complainantName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Full Name"
                fullWidth
                required
                error={!!errors.complainantName}
                helperText={errors.complainantName?.message}
                InputProps={{
                  startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            )}
          />
        </Grid>
        
        <Grid
          size={{
            xs: 12,
            md: 6
          }}>
          <Controller
            name="complainantEmail"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Email Address"
                type="email"
                fullWidth
                required
                error={!!errors.complainantEmail}
                helperText={errors.complainantEmail?.message}
                InputProps={{
                  startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            )}
          />
        </Grid>
        
        <Grid
          size={{
            xs: 12,
            md: 6
          }}>
          <Controller
            name="complainantPhone"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Phone Number (Optional)"
                fullWidth
                error={!!errors.complainantPhone}
                helperText={errors.complainantPhone?.message}
                InputProps={{
                  startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            )}
          />
        </Grid>
        
        <Grid size={12}>
          <Controller
            name="addressLine1"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Address Line 1"
                fullWidth
                required
                error={!!errors.addressLine1}
                helperText={errors.addressLine1?.message}
              />
            )}
          />
        </Grid>
        
        <Grid size={12}>
          <Controller
            name="addressLine2"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Address Line 2 (Optional)"
                fullWidth
                error={!!errors.addressLine2}
                helperText={errors.addressLine2?.message}
              />
            )}
          />
        </Grid>
        
        <Grid
          size={{
            xs: 12,
            md: 6
          }}>
          <Controller
            name="city"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="City"
                fullWidth
                required
                error={!!errors.city}
                helperText={errors.city?.message}
              />
            )}
          />
        </Grid>
        
        <Grid
          size={{
            xs: 12,
            md: 6
          }}>
          <Controller
            name="postcode"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Postcode"
                fullWidth
                required
                error={!!errors.postcode}
                helperText={errors.postcode?.message}
              />
            )}
          />
        </Grid>
      </Grid>
    </Box>
  );

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
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel>{step.label}</StepLabel>
              <StepContent>
                {index === 0 && renderComplainantStep()}
                {index === 1 && (
                  <Box>
                    {/* Category Selection */}
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Category color="primary" />
                      Complaint Category
                    </Typography>
                    
                    <Grid container spacing={3} sx={{ mb: 4 }}>
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

                    {/* Patient & Case Selection */}
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Person color="primary" />
                      Patient & Case Information
                    </Typography>
                    
                    <Grid container spacing={3} sx={{ mb: 4 }}>
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

                    {/* Description */}
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Description color="primary" />
                      Complaint Description
                    </Typography>
                    
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
                  </Box>
                )}
                                {index === 2 && (
                  <Box>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircle color="primary" />
                      Review & Submit
                    </Typography>
                    
                    <Paper elevation={0} sx={{ p: 3, border: '1px solid #e1e5e9', bgcolor: '#f8f9fa' }}>
                      <Typography variant="body2" color="#546e7a" sx={{ mb: 2 }}>
                        Please review your information before submitting
                      </Typography>
                      
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Typography variant="subtitle2" color="primary">Complainant</Typography>
                          <Typography variant="body2">{watch('complainantName')}</Typography>
                          <Typography variant="body2">{watch('complainantEmail')}</Typography>
                          <Typography variant="body2">
                            {watch('addressLine1')}, {watch('city')} {watch('postcode')}
                          </Typography>
                        </Grid>
                        
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Typography variant="subtitle2" color="primary">Complaint Details</Typography>
                          <Typography variant="body2">Category: {watch('selectedMainCategory')}</Typography>
                          <Typography variant="body2">Patient: {watch('selectedPatient')?.name}</Typography>
                          <Typography variant="body2">Case: {watch('selectedCase')}</Typography>
                        </Grid>
                      </Grid>
                      
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
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
                    </Paper>
                  </Box>
                )}
                
                {/* Navigation buttons for each step */}
                <Box sx={{ mb: 2, mt: 3 }}>
                  <div>
                    <Button
                      variant="contained"
                      onClick={index === steps.length - 1 ? handleSubmit(onSubmit) : handleNext}
                      sx={{ mt: 1, mr: 1 }}
                      disabled={submitting}
                    >
                      {index === steps.length - 1 ? 'Submit' : 'Next'}
                    </Button>
                    <Button
                      disabled={index === 0}
                      onClick={handleBack}
                      sx={{ mt: 1, mr: 1 }}
                    >
                      Back
                    </Button>
                  </div>
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </form>
    </Box>
  );
};

export default ComplaintForm; 