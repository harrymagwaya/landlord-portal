import { useState } from 'react';

// material-ui
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select from '@mui/material/Select';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';

// third-party
import { Formik } from 'formik';
import * as Yup from 'yup';

// project imports
import MainCard from 'components/MainCard';
import PageHeader from 'components/PageHeader';
import { useUserActions } from 'hooks/useUsers';

// assets
import UserAddOutlined from '@ant-design/icons/UserAddOutlined';

const userRoles = ['SYSTEM_ADMIN', 'LOAN_ADMIN', 'LANDLORD', 'TENANT'];
const genders = ['MALE', 'FEMALE', 'OTHER'];

const initialValues = {
  username: '',
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  phoneNumber: '',
  gender: '',
  userRole: 'TENANT',
  submit: null
};

const userSchema = Yup.object().shape({
  username: Yup.string().min(3, 'Username must be at least 3 characters').max(50).required('Username is required'),
  email: Yup.string().email('Please provide a valid email address').required('Email is required'),
  password: Yup.string().min(8, 'Password must be at least 8 characters long').required('Password is required'),
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  phoneNumber: Yup.string()
    .matches(/^\+?[0-9]{10,15}$/, 'Please provide a valid phone number (e.g., +256...)')
    .required('Phone number is required'),
  gender: Yup.string().nullable(),
  userRole: Yup.string().oneOf(userRoles).required('User role is required')
});

export default function ManageUsers() {
  const [notice, setNotice] = useState('');
  const { registerUser } = useUserActions();

  return (
    <Grid container rowSpacing={4.5} columnSpacing={2.75}>
      <Grid size={12}>
        <PageHeader title="Add User" description="Create a platform user with the role they should use in the portal." icon={UserAddOutlined} />
      </Grid>

      <Grid size={{ xs: 12, lg: 8 }}>
        <MainCard>
          <Formik
            initialValues={initialValues}
            validationSchema={userSchema}
            onSubmit={async (values, { resetForm, setErrors, setSubmitting }) => {
              try {
                await registerUser({
                  username: values.username,
                  email: values.email,
                  password: values.password,
                  firstName: values.firstName,
                  lastName: values.lastName,
                  phoneNumber: values.phoneNumber,
                  gender: values.gender || null,
                  userRole: values.userRole
                });

                resetForm();
                setNotice('User created successfully.');
              } catch (error) {
                setErrors({ submit: error.message });
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
              <form noValidate onSubmit={handleSubmit}>
                <Grid container spacing={2.5}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Stack sx={{ gap: 1 }}>
                      <InputLabel htmlFor="user-first-name">First Name</InputLabel>
                      <OutlinedInput
                        id="user-first-name"
                        name="firstName"
                        value={values.firstName}
                        onBlur={handleBlur}
                        onChange={handleChange}
                        error={Boolean(touched.firstName && errors.firstName)}
                        fullWidth
                      />
                    </Stack>
                    {touched.firstName && errors.firstName && <FormHelperText error>{errors.firstName}</FormHelperText>}
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Stack sx={{ gap: 1 }}>
                      <InputLabel htmlFor="user-last-name">Last Name</InputLabel>
                      <OutlinedInput
                        id="user-last-name"
                        name="lastName"
                        value={values.lastName}
                        onBlur={handleBlur}
                        onChange={handleChange}
                        error={Boolean(touched.lastName && errors.lastName)}
                        fullWidth
                      />
                    </Stack>
                    {touched.lastName && errors.lastName && <FormHelperText error>{errors.lastName}</FormHelperText>}
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Stack sx={{ gap: 1 }}>
                      <InputLabel htmlFor="user-username">Username</InputLabel>
                      <OutlinedInput
                        id="user-username"
                        name="username"
                        value={values.username}
                        onBlur={handleBlur}
                        onChange={handleChange}
                        error={Boolean(touched.username && errors.username)}
                        fullWidth
                      />
                    </Stack>
                    {touched.username && errors.username && <FormHelperText error>{errors.username}</FormHelperText>}
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Stack sx={{ gap: 1 }}>
                      <InputLabel htmlFor="user-email">Email</InputLabel>
                      <OutlinedInput
                        id="user-email"
                        name="email"
                        type="email"
                        value={values.email}
                        onBlur={handleBlur}
                        onChange={handleChange}
                        error={Boolean(touched.email && errors.email)}
                        fullWidth
                      />
                    </Stack>
                    {touched.email && errors.email && <FormHelperText error>{errors.email}</FormHelperText>}
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Stack sx={{ gap: 1 }}>
                      <InputLabel htmlFor="user-phone">Phone Number</InputLabel>
                      <OutlinedInput
                        id="user-phone"
                        name="phoneNumber"
                        value={values.phoneNumber}
                        onBlur={handleBlur}
                        onChange={handleChange}
                        placeholder="+256700000000"
                        error={Boolean(touched.phoneNumber && errors.phoneNumber)}
                        fullWidth
                      />
                    </Stack>
                    {touched.phoneNumber && errors.phoneNumber && <FormHelperText error>{errors.phoneNumber}</FormHelperText>}
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Stack sx={{ gap: 1 }}>
                      <InputLabel htmlFor="user-password">Password</InputLabel>
                      <OutlinedInput
                        id="user-password"
                        name="password"
                        type="password"
                        value={values.password}
                        onBlur={handleBlur}
                        onChange={handleChange}
                        error={Boolean(touched.password && errors.password)}
                        fullWidth
                      />
                    </Stack>
                    {touched.password && errors.password && <FormHelperText error>{errors.password}</FormHelperText>}
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Stack sx={{ gap: 1 }}>
                      <InputLabel id="user-gender-label">Gender</InputLabel>
                      <Select labelId="user-gender-label" name="gender" value={values.gender} onChange={handleChange} displayEmpty>
                        <MenuItem value="">Not specified</MenuItem>
                        {genders.map((gender) => (
                          <MenuItem key={gender} value={gender}>
                            {gender}
                          </MenuItem>
                        ))}
                      </Select>
                    </Stack>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Stack sx={{ gap: 1 }}>
                      <InputLabel id="user-role-label">Role</InputLabel>
                      <Select labelId="user-role-label" name="userRole" value={values.userRole} onChange={handleChange}>
                        {userRoles.map((role) => (
                          <MenuItem key={role} value={role}>
                            {role}
                          </MenuItem>
                        ))}
                      </Select>
                    </Stack>
                    {touched.userRole && errors.userRole && <FormHelperText error>{errors.userRole}</FormHelperText>}
                  </Grid>
                  {errors.submit && (
                    <Grid size={12}>
                      <Alert severity="error">{errors.submit}</Alert>
                    </Grid>
                  )}
                  <Grid size={12}>
                    <Stack direction="row" sx={{ justifyContent: 'flex-end' }}>
                      <Button type="submit" variant="contained" disabled={isSubmitting}>
                        Add User
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>
              </form>
            )}
          </Formik>
        </MainCard>
      </Grid>

      <Snackbar open={Boolean(notice)} autoHideDuration={3500} onClose={() => setNotice('')}>
        <Alert severity="success" variant="filled" onClose={() => setNotice('')}>
          {notice}
        </Alert>
      </Snackbar>
    </Grid>
  );
}
