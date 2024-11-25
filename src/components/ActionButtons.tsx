import { Box, Button, CircularProgress, Tooltip } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

interface ActionButtonsProps {
  onConvert: () => void;
  onReset: () => void;
  loading: boolean;
  disabled?: boolean;
}

export function ActionButtons({ onConvert, onReset, loading, disabled }: ActionButtonsProps) {
  return (
    <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
      <Tooltip title={disabled ? "Please fix the input JSON errors first" : ""}>
        <span>
          <Button
            variant="contained"
            onClick={onConvert}
            disabled={loading || disabled}
            startIcon={loading ? <CircularProgress size={20} /> : <PlayArrowIcon />}
          >
            Convert
          </Button>
        </span>
      </Tooltip>
      <Button
        variant="outlined"
        onClick={onReset}
        disabled={loading}
        startIcon={<RestartAltIcon />}
      >
        Reset to Sample
      </Button>
    </Box>
  );
}