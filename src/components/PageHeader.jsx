import PropTypes from 'prop-types';

import { Box, Button, Stack, Typography } from '@mui/material';

export default function PageHeader({ title, description, icon: Icon, actions }) {
  return (
    <Box
      sx={{
        mb: 4,
        px: { xs: 2, md: 0 },
        py: 1
      }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
        spacing={3}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          {Icon && (
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: 2,
                display: 'grid',
                placeItems: 'center',
                bgcolor: 'primary.main',
                color: 'white',
                flexShrink: 0
              }}
            >
              <Icon size={24} />
            </Box>
          )}

          <Box>
            <Typography variant="h3" fontWeight={700}>
              {title}
            </Typography>

            {description && (
              <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
                {description}
              </Typography>
            )}
          </Box>
        </Stack>

        {actions && (
          <Stack direction="row" spacing={1.5}>
            {actions}
          </Stack>
        )}
      </Stack>
    </Box>
  );
}

PageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  icon: PropTypes.elementType,
  actions: PropTypes.node
};