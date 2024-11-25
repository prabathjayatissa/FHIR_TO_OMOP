import React from 'react';
import { Box, Button } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DownloadIcon from '@mui/icons-material/Download';

interface FileOperationsProps {
  onFileUpload: (content: string) => void;
  onDownload: () => void;
  hasOutput: boolean;
}

export function FileOperations({ onFileUpload, onDownload, hasOutput }: FileOperationsProps) {
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        onFileUpload(content);
      };
      reader.readAsText(file);
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 2 }}>
      <Button
        component="label"
        variant="outlined"
        startIcon={<UploadFileIcon />}
      >
        Upload FHIR
        <input
          type="file"
          accept="application/json"
          hidden
          onChange={handleFileUpload}
        />
      </Button>
      <Button
        variant="outlined"
        startIcon={<DownloadIcon />}
        onClick={onDownload}
        disabled={!hasOutput}
      >
        Download OMOP
      </Button>
    </Box>
  );
}