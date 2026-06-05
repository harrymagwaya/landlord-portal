// project import
import dashboard from './dashboard';
import loans from './loans';
import users from './users';
import pages from './page';
import utilities from './utilities';
import support from './support';
import properties from './properties';
import riskWeight from './riskWeight';
import eligibility from './eligibility';
import financialRecords from './financialRecords';
import tenantCapacity from './tenantCapacity';
import behavioralFeatures from './behavioralFeatures';
import { getPathForRole } from 'utils/roles';

// ==============================|| MENU ITEMS ||============================== //

const menuItems = {
  items: [dashboard, users, properties, tenantCapacity, financialRecords, behavioralFeatures, riskWeight, eligibility, loans, pages, utilities, support]
};

function applyRoleUrls(role, item) {
  return {
    ...item,
    ...(item.url && { url: getPathForRole(role, item.url) }),
    ...(item.children && { children: item.children.map((child) => applyRoleUrls(role, child)) })
  };
}

export function getMenuItemsForRole(role) {
  const canShowItem = (item) => {
    if (item.hideInMenu) return false;
    if (!item.roles) return true;

    return item.roles.includes(role);
  };

  return {
    items: menuItems.items
      .filter(canShowItem)
      .map((item) => ({
        ...item,
        children: item.children?.filter(canShowItem)
      }))
      .map((item) => applyRoleUrls(role, item))
      .filter((item) => !item.children || item.children.length)
  };
}

export default menuItems;
