// assets
import HomeOutlined from '@ant-design/icons/HomeOutlined';
import ApartmentOutlined from '@ant-design/icons/ApartmentOutlined';
import ProfileOutlined from '@ant-design/icons/ProfileOutlined';
import SolutionOutlined from '@ant-design/icons/SolutionOutlined';

// icons
const icons = {
  HomeOutlined,
  ApartmentOutlined,
  SolutionOutlined,
  ProfileOutlined
};

// ==============================|| MENU ITEMS - PROPERTIES ||============================== //

const properties = {
  id: 'group-properties',
  title: 'Properties',
  type: 'group',
  icon: icons.HomeOutlined,
  roles: ['SYSTEM_ADMIN', 'LANDLORD'],

  children: [
    {
      id: 'properties-directory',
      title: 'Properties',
      type: 'item',
      url: '/properties',
      icon: icons.HomeOutlined,
      roles: ['SYSTEM_ADMIN', 'LANDLORD']
    },

    {
      id: 'property-units',
      title: 'Property Units',
      type: 'item',
      url: '/properties/units',
      icon: icons.ApartmentOutlined,
      roles: ['SYSTEM_ADMIN', 'LANDLORD']
    },
    {
      id: 'rental-profiles',
      title: 'Rental Profiles',
      type: 'item',
      url: '/rental-profiles',
      icon: icons.SolutionOutlined,
      roles: ['SYSTEM_ADMIN', 'LANDLORD']
    }
  ]
};

export default properties;
