// project import
import dashboard from './dashboard';
import loans from './loans';
import users from './users';
import pages from './page';
import utilities from './utilities';
import support from './support';
// ==============================|| MENU ITEMS ||============================== //

const menuItems = {
  items: [dashboard, loans, users, pages, utilities, support]
};

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
      .filter((item) => !item.children || item.children.length)
  };
}

export default menuItems;
