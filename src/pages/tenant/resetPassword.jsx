import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import MainCard from 'components/MainCard';

export default function TenantResetPasswordPage() {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const passwordsMatch = form.newPassword && form.newPassword === form.confirmPassword;

  return (
    <Stack spacing={2}>
      <MainCard title="Reset Password" sx={{ borderRadius: 4 }}>
        <Stack spacing={2}>
          <Alert severity="info">Password reset is not yet connected to a backend endpoint. This screen is ready for the flow wiring.</Alert>

          <TextField
            label="Current Password"
            type="password"
            value={form.currentPassword}
            onChange={(event) => setForm((prev) => ({ ...prev, currentPassword: event.target.value }))}
          />
          <TextField
            label="New Password"
            type="password"
            value={form.newPassword}
            onChange={(event) => setForm((prev) => ({ ...prev, newPassword: event.target.value }))}
          />
          <TextField
            label="Confirm New Password"
            type="password"
            value={form.confirmPassword}
            onChange={(event) => setForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
            error={Boolean(form.confirmPassword) && !passwordsMatch}
            helperText={form.confirmPassword && !passwordsMatch ? 'Passwords do not match' : ' '}
          />

          <Button variant="contained" disabled={!form.currentPassword || !passwordsMatch}>
            Update Password
          </Button>
          <Button component={RouterLink} to="/tenant/profile" variant="text">
            Back to Profile
          </Button>
        </Stack>
      </MainCard>
    </Stack>
  );
}
