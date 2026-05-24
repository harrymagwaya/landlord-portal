// assets
import RadarChartOutlined from '@ant-design/icons/RadarChartOutlined';
import ClusterOutlined from '@ant-design/icons/ClusterOutlined';
import FundOutlined from '@ant-design/icons/FundOutlined';
import HistoryOutlined from '@ant-design/icons/HistoryOutlined';
import UserOutlined from '@ant-design/icons/UserOutlined';

// icons
const icons = {
  RadarChartOutlined,
  ClusterOutlined,
  FundOutlined,
  HistoryOutlined,
  UserOutlined
};

// ==============================|| MENU ITEMS - BEHAVIORAL INTELLIGENCE ||============================== //

const behavioralIntelligence = {
  id: 'group-behavioral-intelligence',
  title: 'Behavioral Intelligence',
  type: 'group',
  icon: icons.RadarChartOutlined,

  roles: ['SYSTEM_ADMIN', 'LOAN_ADMIN'],

  children: [
    {
      id: 'behavioral-snapshots',
      title: 'Behavioral Snapshots',
      type: 'item',
      url: '/behavioral/snapshots',
      icon: icons.ClusterOutlined,

      roles: ['SYSTEM_ADMIN', 'LOAN_ADMIN']
    },

    {
      id: 'behavioral-analytics',
      title: 'Behavior Analytics',
      type: 'item',
      url: '/behavioral/analytics',
      icon: icons.FundOutlined,

      roles: ['SYSTEM_ADMIN', 'LOAN_ADMIN']
    },

    {
      id: 'feature-timeline',
      title: 'Feature Timeline',
      type: 'item',
      url: '/behavioral/timeline',
      icon: icons.HistoryOutlined,

      roles: ['SYSTEM_ADMIN', 'LOAN_ADMIN']
    },
    {
      id: 'behavioral-profile',
      title: 'Behavioral Profile',
      type: 'item',
      url: '/behavioral/profile',
      icon: icons.UserOutlined,
      roles: ['SYSTEM_ADMIN', 'LOAN_ADMIN']
    }
  ]
};

export default behavioralIntelligence;
