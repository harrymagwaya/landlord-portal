// =========================================
// FILE: menu-items/financial-management.js
// =========================================

import WalletOutlined from '@ant-design/icons/WalletOutlined';
import AuditOutlined from '@ant-design/icons/AuditOutlined';
import HistoryOutlined from '@ant-design/icons/HistoryOutlined';
import ApartmentOutlined from '@ant-design/icons/ApartmentOutlined';

const icons = {
  WalletOutlined,
  AuditOutlined,
  HistoryOutlined,
  ApartmentOutlined
};

const financialManagement = {
  id: 'financial-management',
  title: 'Financial Management',
  type: 'group',

  children: [
    // TENANT
    {
      id: 'tenant-financial-records',
      title: 'My Financial Records',
      type: 'item',
      url: '/financial-records/my-records',
      icon: icons.WalletOutlined,

      roles: ['TENANT','LANDLORD', 'SYSTEM_ADMIN']
    },

    // LANDLORD + ADMIN
    {
      id: 'payment-operations',
      title: 'Payment Operations',
      type: 'item',
      url: '/landlord/payment-operations',
      icon: icons.AuditOutlined,

      roles: ['LANDLORD', 'SYSTEM_ADMIN', 'LOAN_ADMIN']
    },

    {
      id: 'property-rent-roll',
      title: 'Property Rent Roll',
      type: 'item',
      url: '/landlord/rent-roll',
      icon: icons.ApartmentOutlined,

      roles: ['LANDLORD', 'SYSTEM_ADMIN']
    },

    {
      id: 'payment-history',
      title: 'Ledger History',
      type: 'item',
      url: '/landlord/ledger-history',
      icon: icons.HistoryOutlined,

      roles: ['LANDLORD', 'SYSTEM_ADMIN']
    }
  ]
};

export default financialManagement;
