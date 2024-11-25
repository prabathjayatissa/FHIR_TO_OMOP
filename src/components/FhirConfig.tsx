import React from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  CircularProgress
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { FhirConfigForm } from './FhirConfigForm';
import { useFhirConfig } from '../hooks/useFhirConfig';

export function FhirConfig() {
  const { config, saveConfig, loading, isConfigured } = useFhirConfig();

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          FHIR API Configuration
        </Typography>

        <FhirConfigForm 
          config={config} 
          onSave={async (newConfig) => {
            const success = saveConfig(newConfig);
            return success;
          }}
        />

        <Box sx={{ mt: 4, textAlign: 'right' }}>
          <Button
            component={RouterLink}
            to="/converter"
            variant="contained"
            endIcon={<ArrowForwardIcon />}
            disabled={!isConfigured}
          >
            Go to Converter
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}