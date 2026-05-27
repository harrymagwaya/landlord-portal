import CheckCircleOutlined from '@ant-design/icons/CheckCircleOutlined';
import DashboardOutlined from '@ant-design/icons/DashboardOutlined';
import FileDoneOutlined from '@ant-design/icons/FileDoneOutlined';
import UserOutlined from '@ant-design/icons/UserOutlined';

const icons = {
  CheckCircleOutlined,
  DashboardOutlined,
  FileDoneOutlined,
  UserOutlined
};

// ==============================|| MENU ITEMS - ELIGIBILITY ENGINE ||============================== //

const eligibility = {
  id: 'group-eligibility',
  title: 'Eligibility Engine',
  type: 'group',
  icon: icons.CheckCircleOutlined,

  roles: ['SYSTEM_ADMIN', 'LOAN_ADMIN'],

  children: [
    {
      id: 'eligibility-overview',
      title: 'Overview',
      type: 'item',
      url: '/eligibility/overview',
      icon: icons.DashboardOutlined,

      roles: ['SYSTEM_ADMIN', 'LOAN_ADMIN']
    },

    {
      id: 'eligibility-assessments',
      title: 'Assessments',
      type: 'item',
      url: '/eligibility/assessments',
      icon: icons.FileDoneOutlined,

      roles: ['SYSTEM_ADMIN', 'LOAN_ADMIN']
    },

    {
      id: 'eligibility-tenant-profile',
      title: 'Tenant Profile',
      type: 'item',
      url: '/eligibility/profile',
      icon: icons.UserOutlined,

      roles: ['SYSTEM_ADMIN', 'LOAN_ADMIN']
    }
  ]
};

export default eligibility;
