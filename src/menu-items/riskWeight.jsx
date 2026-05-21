import SlidersOutlined from '@ant-design/icons/SlidersOutlined';
import RobotOutlined from '@ant-design/icons/RobotOutlined';
import FundOutlined from '@ant-design/icons/FundOutlined';

// icons
const icons = {
  SlidersOutlined,
  RobotOutlined,
  FundOutlined
};

// ==============================|| MENU ITEMS - RISK ||============================== //

const riskWeight = {
  id: 'group-risk',
  title: 'Risk Engine',
  type: 'group',
  icon: icons.SlidersOutlined,
  roles: ['SYSTEM_ADMIN', 'LOAN_ADMIN'],

  children: [
    {
      id: 'risk-weights',
      title: 'Risk Weights',
      type: 'item',
      url: '/risk/weights',
      icon: icons.SlidersOutlined,
      roles: ['SYSTEM_ADMIN', 'LOAN_ADMIN']
    },
    {
      id: 'risk-ai-weights',
      title: 'AI Weights',
      type: 'item',
      url: '/risk/ai-weights',
      icon: icons.RobotOutlined,
      roles: ['SYSTEM_ADMIN', 'LOAN_ADMIN']
    },
    {
      id: 'risk-analytics',
      title: 'Analytics',
      type: 'item',
      url: '/risk/analytics',
      icon: icons.FundOutlined,
      roles: ['SYSTEM_ADMIN', 'LOAN_ADMIN']
    }
  ]
};

export default riskWeight;
