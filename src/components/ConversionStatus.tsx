import { Alert, AlertTitle, Box, CircularProgress } from '@mui/material';

interface ConversionStatusProps {
  loading: boolean;
  error?: string;
}

export function ConversionStatus({ loading, error }: ConversionStatusProps) {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
        <CircularProgress size={20} />
        <Alert severity="info">Converting FHIR data to OMOP format...</Alert>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        <AlertTitle>Error</AlertTitle>
        {error}
      </Alert>
    );
  }

  return null;
}