import CheckCircleOutlined from '@ant-design/icons/CheckCircleOutlined';
import DashboardOutlined from '@ant-design/icons/DashboardOutlined';
import FileDoneOutlined from '@ant-design/icons/FileDoneOutlined';
import DollarOutlined from '@ant-design/icons/DollarOutlined';
import SafetyOutlined from '@ant-design/icons/SafetyOutlined';
import AreaChartOutlined from '@ant-design/icons/AreaChartOutlined';
import AuditOutlined from '@ant-design/icons/AuditOutlined';

const icons = {
  CheckCircleOutlined,
  DashboardOutlined,
  FileDoneOutlined,
  DollarOutlined,
  SafetyOutlined,
  AreaChartOutlined,
  AuditOutlined
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
      id: 'eligibility-limits',
      title: 'Borrowing Limits',
      type: 'item',
      url: '/eligibility/limits',
      icon: icons.DollarOutlined,

      roles: ['SYSTEM_ADMIN', 'LOAN_ADMIN']
    },

    {
      id: 'eligibility-controls',
      title: 'Approval Controls',
      type: 'item',
      url: '/eligibility/controls',
      icon: icons.SafetyOutlined,

      roles: ['SYSTEM_ADMIN', 'LOAN_ADMIN']
    },

    {
      id: 'eligibility-risk-insights',
      title: 'Risk Insights',
      type: 'item',
      url: '/eligibility/risk-insights',
      icon: icons.AreaChartOutlined,

      roles: ['SYSTEM_ADMIN', 'LOAN_ADMIN']
    },

    {
      id: 'eligibility-reviews',
      title: 'Manual Reviews',
      type: 'item',
      url: '/eligibility/reviews',
      icon: icons.AuditOutlined,

      roles: ['SYSTEM_ADMIN', 'LOAN_ADMIN']
    }
  ]
};

export default eligibility;
