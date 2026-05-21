// assets
import WalletOutlined from '@ant-design/icons/WalletOutlined';
import DollarCircleOutlined from '@ant-design/icons/DollarCircleOutlined';
import HistoryOutlined from '@ant-design/icons/HistoryOutlined';

// icons
const icons = {
  WalletOutlined,
  DollarCircleOutlined,
  HistoryOutlined
};

// ==============================|| MENU ITEMS - FINANCIAL RECORDS ||============================== //

const financialRecords = {
  id: 'group-financial-records',
  title: 'Financial Records',
  type: 'group',
  icon: icons.WalletOutlined,

  roles: ['SYSTEM_ADMIN', 'LOAN_ADMIN', 'LANDLORD'],

  children: [
    {
      id: 'financial-records-directory',
      title: 'Payment Records',
      type: 'item',
      url: '/financial-records',
      icon: icons.DollarCircleOutlined,

      roles: ['SYSTEM_ADMIN', 'LOAN_ADMIN', 'LANDLORD']
    },

    {
      id: 'financial-records-history',
      title: 'Payment History',
      type: 'item',
      url: '/financial-records/history',
      icon: icons.HistoryOutlined,

      roles: ['SYSTEM_ADMIN', 'LOAN_ADMIN', 'LANDLORD']
    }
  ]
};

export default financialRecords;
