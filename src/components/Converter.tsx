import { useState } from 'react';
import { Container, Typography, Box, Button } from '@mui/material';
import { JsonEditor } from './JsonEditor';
import { ConversionStatus } from './ConversionStatus';
import { ActionButtons } from './ActionButtons';
import { FileOperations } from './FileOperations';
import { ConversionFlowchart } from './ConversionFlowchart';
import { FhirToOmopConverter } from '../converter';
import { setupDatabase } from '../database';
import { FhirBundleSchema } from '../models/fhir';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { downloadJson } from '../utils/file';
import { sampleFhirData } from '../sample-data';

export function Converter() {
  const [fhirInput, setFhirInput] = useState('');
  const [omopOutput, setOmopOutput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [jsonError, setJsonError] = useState('');
  const { logout } = useAuth();
  const navigate = useNavigate();

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

  const handleFileUpload = (content: string) => {
    handleInputChange(content);
  };

  const handleDownload = () => {
    if (omopOutput) {
      downloadJson(JSON.parse(omopOutput), 'omop-output.json');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4" component="h1">
          FHIR to OMOP Converter
        </Typography>
        <Button variant="outlined" onClick={handleLogout}>
          Log Out
        </Button>
      </Box>
      
      <FileOperations
        onFileUpload={handleFileUpload}
        onDownload={handleDownload}
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
          placeholder="Paste your FHIR resources in JSON format or click 'Reset to Sample' to load sample data"
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