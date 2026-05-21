// assets
import WalletOutlined from '@ant-design/icons/WalletOutlined';
import DollarCircleOutlined from '@ant-design/icons/DollarCircleOutlined';
import FundProjectionScreenOutlined from '@ant-design/icons/FundProjectionScreenOutlined';

// icons
const icons = {
  WalletOutlined,
  DollarCircleOutlined,
  FundProjectionScreenOutlined
};

// ==============================|| MENU ITEMS - FINANCIAL CAPACITY ||============================== //

const tenantCapacity = {
  id: 'group-tenant-capacity',
  title: 'Financial Capacity',
  type: 'group',
  icon: icons.WalletOutlined,
  roles: ['SYSTEM_ADMIN', 'LOAN_ADMIN'],

  children: [
    {
      id: 'tenant-capacity-directory',
      title: 'Tenant Capacity',
      type: 'item',
      url: '/financial-capacity',
      icon: icons.WalletOutlined,
      roles: ['SYSTEM_ADMIN', 'LOAN_ADMIN']
    },

    {
      id: 'tenant-eligibility',
      title: 'Eligibility',
      type: 'item',
      url: '/financial-capacity/eligibility',
      icon: icons.DollarCircleOutlined,
      roles: ['SYSTEM_ADMIN', 'LOAN_ADMIN']
    },

    {
      id: 'tenant-risk-analysis',
      title: 'Risk Analysis',
      type: 'item',
      url: '/financial-capacity/risk-analysis',
      icon: icons.FundProjectionScreenOutlined,
      roles: ['SYSTEM_ADMIN', 'LOAN_ADMIN']
    }
  ]
};

export default tenantCapacity;
