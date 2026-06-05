import PropTypes from 'prop-types';
import React from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';

// material-ui
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// third-party
import * as Yup from 'yup';
import { Formik } from 'formik';

// project imports
import IconButton from 'components/@extended/IconButton';
import AnimateButton from 'components/@extended/AnimateButton';
import useAuth from 'hooks/useAuth';
import { getAppIdForPath } from 'utils/appIdentity';
import { getDefaultPathForRole, USER_ROLES } from 'utils/roles';

// assets
import ApartmentOutlined from '@ant-design/icons/ApartmentOutlined';
import AuditOutlined from '@ant-design/icons/AuditOutlined';
import EyeOutlined from '@ant-design/icons/EyeOutlined';
import EyeInvisibleOutlined from '@ant-design/icons/EyeInvisibleOutlined';
import MobileOutlined from '@ant-design/icons/MobileOutlined';

const APP_TYPES = {
  ADMIN: 'XPRO_ADMIN_PORTAL',
  LANDLORD: 'XPRO_LANDLORD_WEB_APP',
  LOAN: 'XPRO_LOAN_WEB_APP',
  TENANT: 'XPRO_RENTAL_MOBILE_APP'
};

const portalOptions = [
  {
    role: USER_ROLES.LANDLORD,
    appType: APP_TYPES.LANDLORD,
    title: 'Landlord',
    subtitle: 'Properties, tenants, rent roll, and operations',
    icon: ApartmentOutlined
  },
  {
    role: USER_ROLES.LOAN_ADMIN,
    appType: APP_TYPES.LOAN,
    title: 'Loan Admin',
    subtitle: 'Eligibility, risk review, and loan workflows',
    icon: AuditOutlined
  },
  {
    role: USER_ROLES.TENANT,
    appType: APP_TYPES.TENANT,
    title: 'Tenant',
    subtitle: 'Payments, rental profile, score, and unit details',
    icon: MobileOutlined
  }
];

function resolvePortalRole(appType) {
  if (appType === APP_TYPES.LOAN) return USER_ROLES.LOAN_ADMIN;
  if (appType === APP_TYPES.LANDLORD) return USER_ROLES.LANDLORD;
  if (appType === APP_TYPES.ADMIN) return USER_ROLES.SYSTEM_ADMIN;
  if (appType === APP_TYPES.TENANT) return USER_ROLES.TENANT;

  return USER_ROLES.SYSTEM_ADMIN;
}

function getPortalDestination(appType) {
  return getDefaultPathForRole(resolvePortalRole(appType));
}

function getPortalName(appType) {
  return portalOptions.find((option) => option.appType === appType)?.title || 'Account';
}

function buildFriendlyError(message, hadSelection) {
  const normalized = String(message || '').toLowerCase();

  if (normalized.includes('not permitted to access') || normalized.includes('access restricted')) {
    return hadSelection
      ? `This account cannot access the ${hadSelection} portal. Double-check the portal you selected.`
      : 'This account cannot access that portal. Select the right account type to continue.';
  }

  if (normalized.includes('login failed') || normalized.includes('bad credentials') || normalized.includes('invalid') || normalized.includes('forbidden')) {
    return hadSelection ? `Unable to sign in to the ${hadSelection} portal with those details.` : 'Unable to sign in. Check your credentials or select the right account type.';
  }

  return message || 'Unable to sign in right now.';
}

export default function AuthLogin({ defaultAppType = APP_TYPES.ADMIN, allowPortalSelection = true, forcedAppType = null, requirePortalSelection = false }) {
  const [checked, setChecked] = React.useState(false);
  const [toast, setToast] = React.useState({ open: false, message: '', severity: 'error' });
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const requestedPath = location.state?.from?.pathname || location.pathname;
  const portalAppType = location.state?.portalAppType || null;
  const normalizedRequestedPath = requestedPath.replace(/^\/free(?=\/|$)/, '');
  const pathAppType = getAppIdForPath(requestedPath, USER_ROLES.SYSTEM_ADMIN);
  const pathIsPortalSpecific = ['/tenant', '/admin', '/loan', '/landlord'].some(
    (segment) => normalizedRequestedPath === segment || normalizedRequestedPath.startsWith(`${segment}/`)
  );
  const resolvedForcedAppType = forcedAppType || (pathIsPortalSpecific ? pathAppType : null);
  const canSelectPortal = allowPortalSelection && !resolvedForcedAppType;

  const [selectedAppType, setSelectedAppType] = React.useState(resolvedForcedAppType || portalAppType || null);
  const [showPassword, setShowPassword] = React.useState(false);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const closeToast = () => {
    setToast((current) => ({ ...current, open: false }));
  };

  return (
    <>
      <Formik
        initialValues={{
          email: '',
          password: '',
          submit: null
        }}
        validationSchema={Yup.object().shape({
          email: Yup.string().email('Must be a valid email').max(255).required('Email is required'),
          password: Yup.string()
            .required('Password is required')
            .test('no-leading-trailing-whitespace', 'Password cannot start or end with spaces', (value) => value === value.trim())
        })}
        onSubmit={async (values, { setSubmitting }) => {
          const explicitSelection = canSelectPortal ? selectedAppType : resolvedForcedAppType;
          const fallbackAppType = defaultAppType;
          const appType = explicitSelection || fallbackAppType;
          const selectionName = explicitSelection ? getPortalName(explicitSelection) : '';

          if (!appType || (requirePortalSelection && !explicitSelection)) {
            setToast({ open: true, message: 'Select an account type to continue.', severity: 'warning' });
            setSubmitting(false);
            return;
          }

          try {
            const nextRedirectTo = location.state?.from?.pathname || getPortalDestination(appType);

            await login({ email: values.email, password: values.password, appType });
            navigate('/auth/loading', { replace: true, state: { redirectTo: nextRedirectTo } });
          } catch (error) {
            const friendlyMessage = buildFriendlyError(error.message, selectionName);
            setToast({ open: true, message: friendlyMessage, severity: 'error' });
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
          <form noValidate onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {canSelectPortal && (
                <Grid size={12}>
                  <Stack sx={{ gap: 1.5 }}>
                    <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle1" fontWeight={700}>
                        Select Account Type
                      </Typography>
                      {selectedAppType ? <Chip label={getPortalName(selectedAppType)} size="small" color="primary" /> : null}
                    </Stack>

                    <Grid container spacing={1.5}>
                      {portalOptions.map((option) => {
                        const selected = selectedAppType === option.appType;
                        const Icon = option.icon;

                        return (
                          <Grid key={option.role} size={{ xs: 12, sm: 6 }}>
                            <Button
                              fullWidth
                              type="button"
                              variant={selected ? 'contained' : 'outlined'}
                              color={selected ? 'primary' : 'secondary'}
                              onClick={() => setSelectedAppType(option.appType)}
                              startIcon={<Icon />}
                              sx={{
                                justifyContent: 'flex-start',
                                textAlign: 'left',
                                px: 2,
                                py: 1.5,
                                minHeight: 92
                              }}
                            >
                              <Stack spacing={0.5} alignItems="flex-start">
                                <Typography variant="subtitle1" fontWeight={700} color="inherit">
                                  {option.title}
                                </Typography>
                                <Typography variant="caption" color={selected ? 'inherit' : 'text.secondary'} sx={{ whiteSpace: 'normal' }}>
                                  {option.subtitle}
                                </Typography>
                              </Stack>
                            </Button>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Stack>
                </Grid>
              )}

              <Grid size={12}>
                <Stack sx={{ gap: 1 }}>
                  <InputLabel htmlFor="email-login">Email Address</InputLabel>
                  <OutlinedInput
                    id="email-login"
                    type="email"
                    value={values.email}
                    name="email"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="Enter email address"
                    fullWidth
                    error={Boolean(touched.email && errors.email)}
                  />
                </Stack>
                {touched.email && errors.email && (
                  <FormHelperText error id="standard-weight-helper-text-email-login">
                    {errors.email}
                  </FormHelperText>
                )}
              </Grid>
              <Grid size={12}>
                <Stack sx={{ gap: 1 }}>
                  <InputLabel htmlFor="password-login">Password</InputLabel>
                  <OutlinedInput
                    fullWidth
                    error={Boolean(touched.password && errors.password)}
                    id="password-login"
                    type={showPassword ? 'text' : 'password'}
                    value={values.password}
                    name="password"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                          color="secondary"
                        >
                          {showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                        </IconButton>
                      </InputAdornment>
                    }
                    placeholder="Enter password"
                  />
                </Stack>
                {touched.password && errors.password && (
                  <FormHelperText error id="standard-weight-helper-text-password-login">
                    {errors.password}
                  </FormHelperText>
                )}
              </Grid>
              <Grid sx={{ mt: -1 }} size={12}>
                <Stack direction="row" sx={{ gap: 2, alignItems: 'baseline', justifyContent: 'space-between' }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={checked}
                        onChange={(event) => setChecked(event.target.checked)}
                        name="checked"
                        color="primary"
                        size="small"
                      />
                    }
                    label={<Typography variant="h6">Keep me sign in</Typography>}
                  />
                  <Link variant="h6" component={RouterLink} to="#" color="text.primary">
                    Forgot Password?
                  </Link>
                </Stack>
              </Grid>
              <Grid size={12}>
                <AnimateButton>
                  <Button disabled={isSubmitting} fullWidth size="large" type="submit" variant="contained" color="primary">
                    Login
                  </Button>
                </AnimateButton>
              </Grid>
            </Grid>
          </form>
        )}
      </Formik>

      <Snackbar open={toast.open} autoHideDuration={4200} onClose={closeToast} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={closeToast} severity={toast.severity} variant="filled" sx={{ width: '100%' }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </>
  );
}

AuthLogin.propTypes = {
  defaultAppType: PropTypes.string,
  allowPortalSelection: PropTypes.bool,
  forcedAppType: PropTypes.string,
  requirePortalSelection: PropTypes.bool
};
