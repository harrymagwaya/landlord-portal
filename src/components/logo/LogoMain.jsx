// material-ui
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';

// ==============================|| LOGO WORDMARK ||============================== //

export default function LogoMain() {
  const theme = useTheme();

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: 1.25,
          display: 'grid',
          placeItems: 'center',
          bgcolor: 'primary.main',
          color: 'common.white',
          fontWeight: 800,
          fontSize: 18,
          lineHeight: 1
        }}
      >
        X
      </Box>
      <Typography
        variant="h3"
        sx={{
          color: theme.vars.palette.common.black,
          fontWeight: 800,
          letterSpacing: 0,
          lineHeight: 1
        }}
      >
        Xpro
      </Typography>
    </Box>
  );
}
