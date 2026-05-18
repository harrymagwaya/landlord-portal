// assets
import FileSearchOutlined from '@ant-design/icons/FileSearchOutlined';

// icons
const icons = {
  FileSearchOutlined
};

// ==============================|| MENU ITEMS - LOANS ||============================== //

const loans = {
  id: 'group-loans',
  title: 'Loans',
  type: 'group',
  icon: icons.FileSearchOutlined,
  roles: ['SYSTEM_ADMIN', 'LOAN_ADMIN'],
  children: [
    {
      id: 'loan-review',
      title: 'Loan Review',
      type: 'item',
      url: '/loans/review',
      icon: icons.FileSearchOutlined,
      roles: ['SYSTEM_ADMIN', 'LOAN_ADMIN']
    }
  ]
};

export default loans;
