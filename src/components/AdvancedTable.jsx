import PropTypes from 'prop-types';
import { useCallback, useMemo, useState } from 'react';

// material-ui
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';

// third-party
import { Descriptions, Drawer, Space, Table } from 'antd';

// icons
import EyeOutlined from '@ant-design/icons/EyeOutlined';
import EditOutlined from '@ant-design/icons/EditOutlined';

function defaultDetailItems(record) {
  return Object.entries(record || {}).map(([key, value]) => ({
    key,
    label: key,
    children:
      value === null || value === undefined || value === '' ? '-' : typeof value === 'object' ? JSON.stringify(value) : String(value)
  }));
}

export default function AdvancedTable({
  columns,
  dataSource,
  rowKey = 'key',
  loading = false,
  emptyText = 'No records found.',
  detailTitle = 'Details',
  detailItems,
  renderDetails,
  detailActions,
  rowSelection,
  toolbar,
  showActions = true,
  clickableRows = true
}) {
  const [selectedRecord, setSelectedRecord] = useState(null);

  const closeDrawer = useCallback(() => {
    setSelectedRecord(null);
  }, []);

  const openDrawer = useCallback((record) => {
    setSelectedRecord(record);
  }, []);

  const getDetailTitle = () => (typeof detailTitle === 'function' ? detailTitle(selectedRecord) : detailTitle);

  const tableColumns = useMemo(() => {
    if (!showActions) return columns;

    return [
      ...columns,

      // ================= ACTIONS =================
      {
        title: '',
        key: 'actions',
        width: 90,
        align: 'right',

        render: (_, user) => (
          <Stack direction="row" spacing={0.5} justifyContent="flex-end">
            {/* VIEW */}
            <Tooltip title="View">
              <IconButton
                size="small"
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  transition: '0.2s',

                  '&:hover': {
                    bgcolor: 'action.hover'
                  }
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  openDrawer(user);
                }}
              >
                <EyeOutlined style={{ fontSize: 15 }} />
              </IconButton>
            </Tooltip>

            {/* EDIT */}
            <Tooltip title="Edit">
              <IconButton
                size="small"
                color="primary"
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  transition: '0.2s',

                  '&:hover': {
                    bgcolor: 'action.hover'
                  }
                }}
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <EditOutlined style={{ fontSize: 15 }} />
              </IconButton>
            </Tooltip>
          </Stack>
        )
      }
    ];
  }, [columns, showActions, openDrawer]);

  return (
    <>
      {/* ================= TOOLBAR ================= */}
      {toolbar && <div style={{ marginBottom: 16 }}>{toolbar}</div>}

      {/* ================= TABLE ================= */}
      <Table
        columns={tableColumns}
        dataSource={dataSource}
        rowKey={rowKey}
        rowSelection={rowSelection}
        loading={loading}
        rowClassName={() => 'advanced-table-row'}
        size="large"
        scroll={{ x: "100%" }}
        style={{
          borderRadius: 16,
          overflow: 'hidden'
        }}
        pagination={{
          pageSize: 10,
          hideOnSinglePage: false,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50'],
          position: ['bottomRight'],

          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`
        }}
        locale={{ emptyText }}
        onRow={(record) => ({
          onClick: () => clickableRows && openDrawer(record),

          style: clickableRows
            ? {
                cursor: 'pointer'
              }
            : undefined
        })}
      />

      {/* ================= DETAILS DRAWER ================= */}
      <Drawer
        title={selectedRecord ? getDetailTitle() : detailTitle}
        open={Boolean(selectedRecord)}
        onClose={closeDrawer}
        width={typeof window !== 'undefined' && window.innerWidth < 768 ? '100%' : 520}
        styles={{
          body: {
            paddingTop: 8
          }
        }}
        extra={
          selectedRecord && detailActions ? (
            <Space wrap size="small">
              {detailActions(selectedRecord, closeDrawer)}
            </Space>
          ) : null
        }
      >
        {selectedRecord &&
          (renderDetails ? (
            renderDetails(selectedRecord, closeDrawer)
          ) : (
            <Descriptions
              bordered
              column={1}
              size="small"
              items={(detailItems ? detailItems(selectedRecord) : defaultDetailItems(selectedRecord)).map((item) => ({
                ...item,
                children: item.children ?? '-'
              }))}
            />
          ))}
      </Drawer>
    </>
  );
}

AdvancedTable.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.node.isRequired,
      dataIndex: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
      key: PropTypes.string,
      align: PropTypes.oneOf(['left', 'center', 'right']),
      width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      render: PropTypes.func
    })
  ).isRequired,

  dataSource: PropTypes.array,

  rowKey: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),

  loading: PropTypes.bool,

  emptyText: PropTypes.string,

  detailTitle: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),

  detailItems: PropTypes.func,

  renderDetails: PropTypes.func,

  detailActions: PropTypes.func,

  rowSelection: PropTypes.object,

  toolbar: PropTypes.node,

  showActions: PropTypes.bool,

  clickableRows: PropTypes.bool
};

AdvancedTable.defaultProps = {
  dataSource: [],
  showActions: true,
  clickableRows: true
};
