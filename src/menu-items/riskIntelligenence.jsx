// assets
import SafetyCertificateOutlined from '@ant-design/icons/SafetyCertificateOutlined';
import BarChartOutlined from '@ant-design/icons/BarChartOutlined';
import TrophyOutlined from '@ant-design/icons/TrophyOutlined';
import BulbOutlined from '@ant-design/icons/BulbOutlined';
import MonitorOutlined from '@ant-design/icons/MonitorOutlined';

// icons
const icons = {
  SafetyCertificateOutlined,
  BarChartOutlined,
  TrophyOutlined,
  BulbOutlined,
  MonitorOutlined
};

// ==============================|| MENU ITEMS - RISK INTELLIGENCE ||============================== //

const riskIntelligence = {
  id: 'group-risk-intelligence',
  title: 'Risk Intelligence',
  type: 'group',

  roles: ['SYSTEM_ADMIN', 'LOAN_ADMIN'],

  children: [
    {
      id: 'risk-scores',
      title: 'Risk Scores',
      type: 'item',
      url: '/risk/scores',
      icon: icons.SafetyCertificateOutlined,

      roles: ['SYSTEM_ADMIN', 'LOAN_ADMIN']
    },

    {
      id: 'risk-ranking',
      title: 'Risk Ranking',
      type: 'item',
      url: '/risk/ranking',
      icon: icons.TrophyOutlined,

      roles: ['SYSTEM_ADMIN', 'LOAN_ADMIN']
    },

    {
      id: 'prediction-insights',
      title: 'Prediction Insights',
      type: 'item',
      url: '/risk/prediction-insights',
      icon: icons.BulbOutlined,

      roles: ['SYSTEM_ADMIN', 'LOAN_ADMIN']
    },

    {
      id: 'model-monitoring',
      title: 'Model Monitoring',
      type: 'item',
      url: '/risk/model-monitoring',
      icon: icons.MonitorOutlined,

      roles: ['SYSTEM_ADMIN', 'LOAN_ADMIN']
    }
  ]
};

export default riskIntelligence;
