import { useState, useEffect } from 'react';
import { Container, Typography, Box, Button, TextField, MenuItem } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import SettingsIcon from '@mui/icons-material/Settings';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import { JsonEditor } from './JsonEditor';
import { ConversionStatus } from './ConversionStatus';
import { ActionButtons } from './ActionButtons';
import { FileOperations } from './FileOperations';
import { ConversionFlowchart } from './ConversionFlowchart';
import { FhirToOmopConverter } from '../converter';
import { setupDatabase } from '../database';
import { FhirBundleSchema } from '../models/fhir';
import { useAuth } from '../contexts/AuthContext';
import { fetchFhirData } from '../services/fhir';
import { useFhirConfig } from '../hooks/useFhirConfig';
import { sampleFhirData } from '../sample-data';

const RESOURCE_TYPES = [
  'Patient',
  'Condition',
  'Observation',
  'Procedure',
  'MedicationRequest',
  'MedicationDispense',
  'Encounter',
  'DiagnosticReport',
  'AllergyIntolerance',
  'Immunization'
] as const;

type ResourceType = typeof RESOURCE_TYPES[number];

export function Converter() {
  const [fhirInput, setFhirInput] = useState('');
  const [omopOutput, setOmopOutput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [jsonError, setJsonError] = useState('');
  const [resourceType, setResourceType] = useState<ResourceType>('Patient');
  const [resourceId, setResourceId] = useState('');
  const [fetchLoading, setFetchLoading] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { config, loading: configLoading } = useFhirConfig();

  useEffect(() => {
    const savedConfig = localStorage.getItem('fhirConfig');
    if (!savedConfig) {
      navigate('/fhir-config');
    }
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      setError('Failed to log out');
    }
  };

  const handleInputChange = (value: string) => {
    setFhirInput(value);
    if (!value.trim()) {
      setJsonError('');
      return;
    }
    try {
      const parsed = JSON.parse(value);
      FhirBundleSchema.parse(parsed);
      setJsonError('');
    } catch (err) {
      setJsonError(err instanceof Error ? err.message : 'Invalid JSON');
    }
  };

  const handleConvert = async () => {
    try {
      setError('');
      setLoading(true);
      
      const db = await setupDatabase();
      const converter = new FhirToOmopConverter(db);
      const fhirData = JSON.parse(fhirInput);
      const result = await converter.convertBundle(fhirData);
      
      setOmopOutput(JSON.stringify(result, null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    const sampleData = JSON.stringify(sampleFhirData, null, 2);
    setFhirInput(sampleData);
    setOmopOutput('');
    setError('');
    setJsonError('');
  };

  const handleFetchFromApi = async () => {
    try {
      setFetchLoading(true);
      setError('');
      
      let mainResource;
      if (resourceId) {
        // Fetch specific resource by ID
        mainResource = await fetchFhirData(config, resourceType, resourceId);
      } else {
        // Fetch all resources of the specified type (limited to 10)
        mainResource = await fetchFhirData(config, resourceType, undefined, '_count=10');
      }
      
      // If it's a Patient resource and we have an ID, fetch related resources
      const relatedResources: { entry: Array<{ resource: unknown }> } = { entry: [] };
      if (resourceType === 'Patient' && resourceId) {
        const types = RESOURCE_TYPES.filter(type => type !== 'Patient');
        const fetchPromises = types.map(type => 
          fetchFhirData(config, type, undefined, `patient=${resourceId}&_count=5`)
            .catch(() => ({ entry: [] })) // Ignore errors for related resources
        );
        
        const results = await Promise.all(fetchPromises);
        relatedResources.entry = results.flatMap(result => result.entry || []);
      }

      // Combine all resources into a single bundle
      const bundle = {
        resourceType: 'Bundle',
        type: 'collection',
        entry: [
          ...(mainResource.entry || [{ resource: mainResource }]),
          ...relatedResources.entry
        ].filter(entry => entry.resource) // Filter out any invalid entries
      };

      setFhirInput(JSON.stringify(bundle, null, 2));
      setJsonError('');
    } catch (err) {
      setError('Failed to fetch from FHIR API: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setFetchLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4" component="h1">
          FHIR to OMOP Converter
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            component={RouterLink}
            to="/fhir-config"
            startIcon={<SettingsIcon />}
            variant="outlined"
          >
            FHIR Settings
          </Button>
          <Button variant="outlined" onClick={handleLogout}>
            Log Out
          </Button>
        </Box>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Fetch from FHIR API
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          <TextField
            select
            label="Resource Type"
            value={resourceType}
            onChange={(e) => setResourceType(e.target.value as ResourceType)}
            sx={{ minWidth: 200 }}
          >
            {RESOURCE_TYPES.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Resource ID"
            value={resourceId}
            onChange={(e) => setResourceId(e.target.value)}
            helperText="Leave empty to fetch multiple resources"
          />
          <Button
            variant="contained"
            startIcon={<CloudDownloadIcon />}
            onClick={handleFetchFromApi}
            disabled={fetchLoading || configLoading || !config.baseUrl}
          >
            {fetchLoading ? 'Fetching...' : 'Fetch'}
          </Button>
        </Box>
      </Box>
      
      <FileOperations
        onFileUpload={handleInputChange}
        onDownload={() => {
          if (omopOutput) {
            const blob = new Blob([omopOutput], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'omop-output.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }
        }}
        hasOutput={!!omopOutput}
      />
      
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: 2,
        minHeight: '500px',
        mt: 2
      }}>
        <JsonEditor
          label="FHIR Resources Input"
          value={fhirInput}
          onChange={handleInputChange}
          error={jsonError}
          placeholder="Paste your FHIR resources in JSON format, click 'Reset to Sample' to load sample data, or use the FHIR API fetch above"
        />
        <JsonEditor
          label="OMOP CDM Output"
          value={omopOutput}
          readOnly
          placeholder="Converted OMOP data will appear here"
        />
      </Box>

      <ConversionStatus loading={loading} error={error} />
      
      <ActionButtons
        onConvert={handleConvert}
        onReset={handleReset}
        loading={loading}
        disabled={!fhirInput.trim() || !!jsonError}
      />

      {fhirInput && !jsonError && (
        <ConversionFlowchart 
          input={JSON.parse(fhirInput)}
          output={omopOutput ? JSON.parse(omopOutput) : null}
        />
      )}
    </Container>
  );
}