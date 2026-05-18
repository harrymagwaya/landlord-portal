import PropTypes from 'prop-types';
import { useMemo } from 'react';

// material-ui
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// third-party
import { Tag, Tooltip } from 'antd';

// project imports
import AdvancedTable from 'components/AdvancedTable';
import MainCard from 'components/MainCard';
import PageHeader from 'components/PageHeader';
import { useUsers } from 'hooks/useUsers';

// icons
import ReloadOutlined from '@ant-design/icons/ReloadOutlined';
import TeamOutlined from '@ant-design/icons/TeamOutlined';

function getUsersFromPage(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

function getUserRole(user) {
  return user.userRole || user.role || user.userType;
}

function getDisplayName(user) {
  const name = [user.firstName, user.lastName].filter(Boolean).join(' ');

  return name || user.username || 'Unknown user';
}

export default function UserDirectory({ title, subtitle, roleFilter }) {
  const { data, error, isLoading, mutate } = useUsers({ size: 100 });

  const users = useMemo(() => getUsersFromPage(data), [data]);

  const visibleUsers = roleFilter ? users.filter((u) => getUserRole(u) === roleFilter) : users;

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 220,

      render: (id) => {
        if (!id) return '-';

        const full = String(id);
        const short = full.length > 16 ? `${full.slice(0, 8)}...${full.slice(-6)}` : full;

        return (
          <Tooltip title={full}>
            <Box
              sx={{
                fontFamily: 'monospace',
                fontSize: 12.5,
                fontWeight: 600,
                color: 'text.secondary',
                letterSpacing: 0.2
              }}
            >
              {short}
            </Box>
          </Tooltip>
        );
      }
    },

    {
      title: 'User',
      key: 'user',
      width: 140,
      render: (_, user) => (
        <Stack direction="row" spacing={1.2} alignItems="center">
          <Avatar sx={{ width: 32, height: 32 }}>{user.firstName?.[0] || 'U'}</Avatar>

          <Box sx={{ minWidth: 0 }}>
            <Typography fontWeight={600} noWrap>
              {getDisplayName(user)}
            </Typography>

            <Typography variant="caption" color="text.secondary" noWrap>
              {user.email}
            </Typography>
          </Box>
        </Stack>
      )
    },

    // ================= ROLE =================
    {
      title: 'Role',
      key: 'role',
      width: 60,
      render: (_, user) => (
        <Tag
          color="blue"
          style={{
            borderRadius: 999,
            paddingInline: 12,
            fontWeight: 500
          }}
        >
          {getUserRole(user) || '-'}
        </Tag>
      )
    },

    // ================= STATUS =================
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status) => {
        const active = status === 'ACTIVE';

        return (
          <Tag
            color={active ? 'success' : 'default'}
            style={{
              borderRadius: 999,
              paddingInline: 12,
              fontWeight: 500
            }}
          >
            {status || 'UNKNOWN'}
          </Tag>
        );
      }
    }
  ];

  return (
    <Grid container rowSpacing={3}>
      {/* ================= PAGE HEADER ================= */}
      <Grid size={12}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} justifyContent="space-between">
          <PageHeader title={title} description={subtitle} icon={TeamOutlined} />

          {/* <Button variant="outlined" color="secondary" startIcon={<ReloadOutlined />} onClick={() => mutate()}>
            Refresh
          </Button> */}
        </Stack>
      </Grid>

      {/* ================= RESULT COUNT ================= */}
      <Grid size={12}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center'
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {visibleUsers.length} results
          </Typography>
        </Box>
      </Grid>

      {/* ================= TABLE ================= */}
      <Grid size={12}>
        <MainCard content={false}>
          {error && (
            <Box sx={{ p: 2 }}>
              <Alert severity="error">{error.message}</Alert>
            </Box>
          )}

          <AdvancedTable
            columns={columns}
            dataSource={visibleUsers}
            rowKey={(u) => u.id || u.userId || u.email}
            loading={isLoading}
            emptyText="No users found."
            detailTitle={(u) => getDisplayName(u)}
            detailItems={(user) => [
              {
                key: 'id',
                label: 'User ID',
                children: user.id || user.userId || '-'
              },
              {
                key: 'name',
                label: 'Name',
                children: getDisplayName(user)
              },
              {
                key: 'email',
                label: 'Email',
                children: user.email || '-'
              },
              {
                key: 'phoneNumber',
                label: 'Phone',
                children: user.phoneNumber || '-'
              },
              {
                key: 'role',
                label: 'Role',
                children: <Tag color="blue">{getUserRole(user) || '-'}</Tag>
              },
              {
                key: 'status',
                label: 'Status',
                children: <Tag color={user.status === 'ACTIVE' ? 'green' : 'default'}>{user.status || 'UNKNOWN'}</Tag>
              }
            ]}
          />
        </MainCard>
      </Grid>
    </Grid>
  );
}

UserDirectory.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  roleFilter: PropTypes.string
};
