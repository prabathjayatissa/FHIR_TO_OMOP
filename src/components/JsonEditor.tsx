import { TextField, Paper, Typography } from '@mui/material';

interface JsonEditorProps {
  value: string;
  onChange?: (value: string) => void;
  label: string;
  readOnly?: boolean;
  error?: string;
  placeholder?: string;
}

export function JsonEditor({ value, onChange, label, readOnly, error, placeholder }: JsonEditorProps) {
  return (
    <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom>
        {label}
      </Typography>
      <TextField
        multiline
        fullWidth
        rows={20}
        value={value}
        onChange={e => onChange?.(e.target.value)}
        error={!!error}
        helperText={error}
        placeholder={placeholder}
        InputProps={{ 
          readOnly,
          sx: { 
            fontFamily: 'monospace',
            flex: 1,
            '& .MuiInputBase-input': {
              height: '100%'
            }
          }
        }}
        sx={{ flex: 1 }}
      />
    </Paper>
  );
}