import CheckCircleOutlined from '@ant-design/icons/CheckCircleOutlined';

const icons = {
  CheckCircleOutlined
};

// ==============================|| MENU ITEMS - ELIGIBILITY ||============================== //

const eligibility = {
  id: 'group-eligibility',
  title: 'Eligibility',
  type: 'group',
  icon: icons.CheckCircleOutlined,
  roles: ['SYSTEM_ADMIN', 'LOAN_ADMIN'],

  children: [
    {
      id: 'eligibility-dashboard',
      title: 'Eligibility Dashboard',
      type: 'item',
      url: '/eligibility',
      icon: icons.CheckCircleOutlined,
      roles: ['SYSTEM_ADMIN', 'LOAN_ADMIN']
    }
  ]
};

export default eligibility;
