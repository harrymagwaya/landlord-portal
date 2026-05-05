import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';

// ==============================|| AUTH BACKGROUND ||============================== //

export default function AuthBackground() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: -1,
        overflow: 'hidden',
        background: `linear-gradient(180deg, ${theme.palette.background.paper} 0%, ${theme.palette.primary.lighter || theme.palette.primary.light} 100%)`,
      }}
    >
      {/* 1. REALISTIC BUILDING TEXTURE (Low Opacity) */}
      <Box
        component="img"
        src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070"
        alt="background"
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: 0.04, // Very faint texture
          filter: 'grayscale(100%)',
        }}
      />

      {/* 2. DECORATIVE SUNLIGHT EFFECT */}
      <Box
        sx={{
          position: 'absolute',
          top: -100,
          right: -50,
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${theme.palette.primary.light} 0%, transparent 70%)`,
          opacity: 0.2,
          filter: 'blur(60px)',
        }}
      />

      {/* 3. ARCHITECTURAL SVG SILHOUETTE */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          lineHeight: 0, // Removes extra bottom spacing
          opacity: 0.1,
        }}
      >
        <svg
          width="100%"
          viewBox="0 0 1000 300"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMax slice"
        >
          <path
            d="M0 300H1000V250H950V100H850V250H820V150H720V250H680V50H550V250H500V120H400V250H350V80H220V250H180V180H80V300H0Z"
            fill={theme.palette.primary.main}
          />
        </svg>
      </Box>

      {/* 4. BLUR OVERLAY (Bottom Fade) */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          width: '100%',
          height: '25vh',
          background: `linear-gradient(to top, ${theme.palette.background.default}, transparent)`,
        }}
      />
    </Box>
  );
}