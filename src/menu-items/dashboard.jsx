// assets
import { DashboardOutlined } from '@ant-design/icons';

// icons
const icons = {
  DashboardOutlined
};

// ==============================|| MENU ITEMS - DASHBOARD ||============================== //

const dashboard = {
  id: 'group-dashboard',
  title: 'Navigation',
  type: 'group',
  icon: icons.DashboardOutlined,
  roles: ['SYSTEM_ADMIN', 'LOAN_ADMIN', 'LANDLORD', 'TENANT'],
  children: [
    {
      id: 'dashboard',
      title: 'Dashboard',
      type: 'item',
      url: '/dashboard/default',
      icon: icons.DashboardOutlined,
      roles: ['SYSTEM_ADMIN', 'LOAN_ADMIN', 'LANDLORD', 'TENANT'],
      breadcrumbs: false
    }
  ]
};

export default dashboard;
