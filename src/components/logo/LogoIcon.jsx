// material-ui
import Box from '@mui/material/Box';

// ==============================|| LOGO ICON SVG ||============================== //

export default function LogoIcon() {
  return (
    <Box
      sx={{
        width: 35,
        height: 35,
        borderRadius: 1.25,
        display: 'grid',
        placeItems: 'center',
        bgcolor: 'primary.main',
        color: 'common.white',
        fontWeight: 800,
        fontSize: 20,
        lineHeight: 1
      }}
    >
      X
    </Box>
  );
}
