import { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

// material-ui
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// third-party
import * as Yup from 'yup';
import { Formik } from 'formik';

// project imports
import IconButton from 'components/@extended/IconButton';
import AnimateButton from 'components/@extended/AnimateButton';
import { useUserActions } from 'hooks/useUsers';
import { strengthColor, strengthIndicator } from 'utils/password-strength';

// assets
import EyeOutlined from '@ant-design/icons/EyeOutlined';
import EyeInvisibleOutlined from '@ant-design/icons/EyeInvisibleOutlined';

export default function AuthRegister() {
  const navigate = useNavigate();
  const { registerUser } = useUserActions();
  const [level, setLevel] = useState();
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState({ open: false, message: '', severity: 'success' });

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const changePassword = (value) => {
    const temp = strengthIndicator(value);
    setLevel(strengthColor(temp));
  };

  useEffect(() => {
    changePassword('');
  }, []);

  return (
    <>
      <Formik
        initialValues={{
          firstName: '',
          lastName: '',
          username: '',
          email: '',
          phoneNumber: '',
          gender: '',
          password: '',
          confirmPassword: ''
        }}
        validationSchema={Yup.object().shape({
          firstName: Yup.string().max(255).required('First Name is required'),
          lastName: Yup.string().max(255).required('Last Name is required'),
          username: Yup.string().min(3, 'Username must be at least 3 characters').max(50).required('Username is required'),
          email: Yup.string().email('Must be a valid email').max(255).required('Email is required'),
          phoneNumber: Yup.string()
            .matches(/^\+?[0-9]{10,15}$/, 'Please provide a valid phone number (e.g. +256...)')
            .required('Phone Number is required'),
          gender: Yup.string().nullable(),
          password: Yup.string()
            .required('Password is required')
            .min(8, 'Password must be at least 8 characters long')
            .test('no-leading-trailing-whitespace', 'Password cannot start or end with spaces', (value) => value === value.trim()),
          confirmPassword: Yup.string()
            .oneOf([Yup.ref('password')], 'Passwords must match')
            .required('Confirm Password is required')
        })}
        onSubmit={async (values, { setErrors, setSubmitting }) => {
          try {
            await registerUser(
              {
                firstName: values.firstName,
                lastName: values.lastName,
                username: values.username,
                email: values.email,
                phoneNumber: values.phoneNumber,
                gender: values.gender || null,
                password: values.password,
                userRole: 'TENANT'
              },
              null
            );

            setNotice({ open: true, message: 'Tenant account created. You can now sign in.', severity: 'success' });
            window.setTimeout(() => navigate('/user/login', { replace: true }), 800);
          } catch (error) {
            setErrors({ submit: error.message || 'Unable to create your tenant account.' });
            setNotice({ open: true, message: error.message || 'Unable to create your tenant account.', severity: 'error' });
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
          <form noValidate onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Stack sx={{ gap: 1 }}>
                  <InputLabel htmlFor="firstName-signup">First Name*</InputLabel>
                  <OutlinedInput
                    id="firstName-signup"
                    value={values.firstName}
                    name="firstName"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="John"
                    fullWidth
                    error={Boolean(touched.firstName && errors.firstName)}
                  />
                </Stack>
                {touched.firstName && errors.firstName && <FormHelperText error>{errors.firstName}</FormHelperText>}
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Stack sx={{ gap: 1 }}>
                  <InputLabel htmlFor="lastName-signup">Last Name*</InputLabel>
                  <OutlinedInput
                    fullWidth
                    error={Boolean(touched.lastName && errors.lastName)}
                    id="lastName-signup"
                    value={values.lastName}
                    name="lastName"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="Doe"
                  />
                </Stack>
                {touched.lastName && errors.lastName && <FormHelperText error>{errors.lastName}</FormHelperText>}
              </Grid>
              <Grid size={12}>
                <Stack sx={{ gap: 1 }}>
                  <InputLabel htmlFor="username-signup">Username*</InputLabel>
                  <OutlinedInput
                    fullWidth
                    error={Boolean(touched.username && errors.username)}
                    id="username-signup"
                    value={values.username}
                    name="username"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="johndoe"
                    autoCapitalize="none"
                  />
                </Stack>
                {touched.username && errors.username && <FormHelperText error>{errors.username}</FormHelperText>}
              </Grid>
              <Grid size={12}>
                <Stack sx={{ gap: 1 }}>
                  <InputLabel htmlFor="email-signup">Email Address*</InputLabel>
                  <OutlinedInput
                    fullWidth
                    error={Boolean(touched.email && errors.email)}
                    id="email-signup"
                    type="email"
                    value={values.email}
                    name="email"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="tenant@example.com"
                    autoCapitalize="none"
                  />
                </Stack>
                {touched.email && errors.email && <FormHelperText error>{errors.email}</FormHelperText>}
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Stack sx={{ gap: 1 }}>
                  <InputLabel htmlFor="phone-signup">Phone Number*</InputLabel>
                  <OutlinedInput
                    fullWidth
                    error={Boolean(touched.phoneNumber && errors.phoneNumber)}
                    id="phone-signup"
                    value={values.phoneNumber}
                    name="phoneNumber"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="+256700000000"
                  />
                </Stack>
                {touched.phoneNumber && errors.phoneNumber && <FormHelperText error>{errors.phoneNumber}</FormHelperText>}
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Stack sx={{ gap: 1 }}>
                  <InputLabel htmlFor="gender-signup">Gender</InputLabel>
                  <TextField select id="gender-signup" name="gender" value={values.gender} onChange={handleChange} onBlur={handleBlur}>
                    <MenuItem value="">Prefer not to say</MenuItem>
                    <MenuItem value="MALE">Male</MenuItem>
                    <MenuItem value="FEMALE">Female</MenuItem>
                    <MenuItem value="OTHER">Other</MenuItem>
                  </TextField>
                </Stack>
              </Grid>
              <Grid size={12}>
                <Stack sx={{ gap: 1 }}>
                  <InputLabel htmlFor="password-signup">Password*</InputLabel>
                  <OutlinedInput
                    fullWidth
                    error={Boolean(touched.password && errors.password)}
                    id="password-signup"
                    type={showPassword ? 'text' : 'password'}
                    value={values.password}
                    name="password"
                    onBlur={handleBlur}
                    onChange={(e) => {
                      handleChange(e);
                      changePassword(e.target.value);
                    }}
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
                    placeholder="Create a secure password"
                  />
                </Stack>
                {touched.password && errors.password && <FormHelperText error>{errors.password}</FormHelperText>}
                <FormControl fullWidth sx={{ mt: 2 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid>
                      <Box sx={{ bgcolor: level?.color, width: 85, height: 8, borderRadius: '7px' }} />
                    </Grid>
                    <Grid>
                      <Typography variant="subtitle1" fontSize="0.75rem">
                        {level?.label}
                      </Typography>
                    </Grid>
                  </Grid>
                </FormControl>
              </Grid>
              <Grid size={12}>
                <Stack sx={{ gap: 1 }}>
                  <InputLabel htmlFor="confirmPassword-signup">Confirm Password*</InputLabel>
                  <OutlinedInput
                    fullWidth
                    error={Boolean(touched.confirmPassword && errors.confirmPassword)}
                    id="confirmPassword-signup"
                    type={showPassword ? 'text' : 'password'}
                    value={values.confirmPassword}
                    name="confirmPassword"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="Repeat your password"
                  />
                </Stack>
                {touched.confirmPassword && errors.confirmPassword && <FormHelperText error>{errors.confirmPassword}</FormHelperText>}
              </Grid>
              <Grid size={12}>
                <Typography variant="body2">
                  By signing up, you agree to our &nbsp;
                  <Link variant="subtitle2" component={RouterLink} to="#">
                    Terms of Service
                  </Link>
                  &nbsp; and &nbsp;
                  <Link variant="subtitle2" component={RouterLink} to="#">
                    Privacy Policy
                  </Link>
                </Typography>
              </Grid>
              {errors.submit && (
                <Grid size={12}>
                  <Alert severity="error">{errors.submit}</Alert>
                </Grid>
              )}
              <Grid size={12}>
                <AnimateButton>
                  <Button fullWidth size="large" type="submit" variant="contained" color="primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Creating Account...' : 'Create Tenant Account'}
                  </Button>
                </AnimateButton>
              </Grid>
            </Grid>
          </form>
        )}
      </Formik>

      <Snackbar open={notice.open} autoHideDuration={4000} onClose={() => setNotice((prev) => ({ ...prev, open: false }))}>
        <Alert severity={notice.severity} variant="filled" onClose={() => setNotice((prev) => ({ ...prev, open: false }))}>
          {notice.message}
        </Alert>
      </Snackbar>
    </>
  );
}
