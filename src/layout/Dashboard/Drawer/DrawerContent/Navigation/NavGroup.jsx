import PropTypes from 'prop-types';
import { matchPath, useLocation } from 'react-router-dom';
// material-ui
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project import
import NavItem from './NavItem';
import { useGetMenuMaster } from 'api/menu';

// ==============================|| NAVIGATION - LIST GROUP ||============================== //

export default function NavGroup({ item }) {
  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster.isDashboardDrawerOpened;
  const { pathname } = useLocation();
  const activeItem = item.children?.find((menuItem) => menuItem.url && matchPath({ path: menuItem.url, end: false }, pathname));
  const defaultItem = activeItem || item.children?.[0];

  if (!drawerOpen && defaultItem) {
    const collapsedItem = {
      ...defaultItem,
      id: `${item.id}-collapsed`,
      title: item.title,
      icon: item.icon || defaultItem.icon,
      url: activeItem?.url || defaultItem.url
    };

    return (
      <List sx={{ mb: 0.25, py: 0, zIndex: 0 }}>
        <NavItem item={collapsedItem} level={1} />
      </List>
    );
  }

  const navCollapse = item.children?.map((menuItem) => {
    switch (menuItem.type) {
      case 'collapse':
        return (
          <Typography key={menuItem.id} variant="caption" color="error" sx={{ p: 2.5 }}>
            collapse - only available in paid version
          </Typography>
        );
      case 'item':
        return <NavItem key={menuItem.id} item={menuItem} level={1} />;
      default:
        return (
          <Typography key={menuItem.id} variant="h6" color="error" align="center">
            Fix - Group Collapse or Items
          </Typography>
        );
    }
  });

  return (
    <List
      subheader={
        item.title &&
        drawerOpen && (
          <Box sx={{ pl: 3, mb: 1.5 }}>
            <Typography variant="subtitle2" color="textSecondary">
              {item.title}
            </Typography>
            {/* only available in paid version */}
          </Box>
        )
      }
      sx={{ mb: drawerOpen ? 1.5 : 0, py: 0, zIndex: 0 }}
    >
      {navCollapse}
    </List>
  );
}

NavGroup.propTypes = { item: PropTypes.object };
