import React, { useState } from 'react';
import {
  Box,
  TextField,
  FormControlLabel,
  Switch,
  Typography,
  Alert,
  IconButton,
  Tooltip,
  CircularProgress,
  Button
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import TestIcon from '@mui/icons-material/PlayArrow';
import { type FhirConfig, type FhirConnectionStatus } from '../types/fhir';
import { testFhirConnection } from '../services/fhir';

interface FhirConfigFormProps {
  config: FhirConfig;
  onSave: (config: FhirConfig) => Promise<boolean>;
}

export function FhirConfigForm({ config, onSave }: FhirConfigFormProps) {
  const [formData, setFormData] = useState<FhirConfig>(config);
  const [status, setStatus] = useState<FhirConnectionStatus | null>(null);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const success = await onSave(formData);
      setStatus({
        success,
        message: success ? 'Configuration saved successfully' : 'Failed to save configuration'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setStatus(null);
    
    try {
      const success = await testFhirConnection(formData);
      setStatus({
        success,
        message: success ? 'Successfully connected to FHIR server' : 'Failed to connect to FHIR server'
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Box component="form" sx={{ mt: 3 }}>
      <TextField
        fullWidth
        label="FHIR Server Base URL"
        value={formData.baseUrl}
        onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
        margin="normal"
        required
        helperText="Example: https://hapi.fhir.org/baseR4"
      />

      <FormControlLabel
        control={
          <Switch
            checked={formData.useAuth}
            onChange={(e) => setFormData({ ...formData, useAuth: e.target.checked })}
          />
        }
        label="Use Authentication"
        sx={{ mt: 2 }}
      />

      {formData.useAuth && (
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="API Key"
            value={formData.apiKey || ''}
            onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
            margin="normal"
            type="password"
            helperText="Leave empty if using username/password"
          />
          
          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
            Or use username/password:
          </Typography>
          
          <TextField
            fullWidth
            label="Username"
            value={formData.username || ''}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            margin="normal"
          />
          
          <TextField
            fullWidth
            label="Password"
            value={formData.password || ''}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            margin="normal"
            type="password"
          />
        </Box>
      )}

      {status && (
        <Alert 
          severity={status.success ? 'success' : 'error'}
          sx={{ mt: 2 }}
        >
          {status.message}
        </Alert>
      )}

      <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          disabled={saving}
          startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
        >
          {saving ? 'Saving...' : 'Save Configuration'}
        </Button>

        <Button
          variant="outlined"
          color="secondary"
          onClick={handleTest}
          disabled={testing}
          startIcon={testing ? <CircularProgress size={20} /> : <TestIcon />}
        >
          {testing ? 'Testing...' : 'Test Connection'}
        </Button>
      </Box>
    </Box>
  );
}