// assets
import TeamOutlined from '@ant-design/icons/TeamOutlined';
import UserAddOutlined from '@ant-design/icons/UserAddOutlined';
import UserSwitchOutlined from '@ant-design/icons/UserSwitchOutlined';

// icons
const icons = {
  TeamOutlined,
  UserAddOutlined,
  UserSwitchOutlined
};

// ==============================|| MENU ITEMS - USERS ||============================== //

const users = {
  id: 'group-users',
  title: 'Users',
  type: 'group',
  icon: icons.TeamOutlined,
  roles: ['SYSTEM_ADMIN'],
  children: [
    {
      id: 'users-tenants',
      title: 'Tenants',
      type: 'item',
      url: '/users/tenants',
      icon: icons.TeamOutlined,
      roles: ['SYSTEM_ADMIN']
    },
    {
      id: 'users-landlords',
      title: 'Landlords',
      type: 'item',
      url: '/users/landlords',
      icon: icons.UserSwitchOutlined,
      roles: ['SYSTEM_ADMIN']
    },
     {
      id: 'users-loan-Admin',
      title: 'Loan Admin',
      type: 'item',
      url: '/users/loan-admins',
      icon: icons.UserSwitchOutlined,
      roles: ['SYSTEM_ADMIN']
    },
    {
      id: 'users-manage',
      title: 'Manage Users',
      type: 'item',
      url: '/users/manage',
      icon: icons.UserAddOutlined,
      roles: ['SYSTEM_ADMIN']
    }
  ]
};

export default users;
