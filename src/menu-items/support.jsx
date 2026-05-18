// assets
import { ChromeOutlined, QuestionOutlined } from '@ant-design/icons';

// icons
const icons = {
  ChromeOutlined,
  QuestionOutlined
};

// ==============================|| MENU ITEMS - SAMPLE PAGE & DOCUMENTATION ||============================== //

const support = {
  id: 'support',
  title: 'Support',
  type: 'group',
  icon: icons.QuestionOutlined,
  roles: ['SYSTEM_ADMIN'],
  children: [
    {
      id: 'sample-page',
      title: 'Sample Page',
      type: 'item',
      url: '/sample-page',
      icon: icons.ChromeOutlined,
      roles: ['SYSTEM_ADMIN']
    },
    {
      id: 'documentation',
      title: 'Documentation',
      type: 'item',
      url: '#',
      icon: icons.QuestionOutlined,
      external: true,
      target: true,
      roles: ['SYSTEM_ADMIN']
    }
  ]
};

export default support;
