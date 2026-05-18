// material-ui
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// third-party
import { NumericFormat } from 'react-number-format';

// project imports
import AdvancedTable from 'components/AdvancedTable';
import Dot from 'components/@extended/Dot';

function createData(tracking_no, name, fat, carbs, protein) {
  return { key: tracking_no, tracking_no, name, fat, carbs, protein };
}

const rows = [
  createData(84564564, 'Camera Lens', 40, 2, 40570),
  createData(98764564, 'Laptop', 300, 0, 180139),
  createData(98756325, 'Mobile', 355, 1, 90989),
  createData(98652366, 'Handset', 50, 1, 10239),
  createData(13286564, 'Computer Accessories', 100, 1, 83348),
  createData(86739658, 'TV', 99, 0, 410780),
  createData(13256498, 'Keyboard', 125, 2, 70999),
  createData(98753263, 'Mouse', 89, 2, 10570),
  createData(98753275, 'Desktop', 185, 1, 98063),
  createData(98753291, 'Chair', 100, 0, 14001)
];

function OrderStatus({ status }) {
  let color;
  let title;

  switch (status) {
    case 0:
      color = 'warning';
      title = 'Pending';
      break;
    case 1:
      color = 'success';
      title = 'Approved';
      break;
    case 2:
      color = 'error';
      title = 'Rejected';
      break;
    default:
      color = 'primary';
      title = 'None';
  }

  return (
    <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
      <Dot color={color} />
      <Typography>{title}</Typography>
    </Stack>
  );
}

const columns = [
  {
    title: 'Tracking No.',
    dataIndex: 'tracking_no',
    key: 'tracking_no',
    render: (trackingNo) => <Link color="secondary">{trackingNo}</Link>
  },
  {
    title: 'Product Name',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: 'Total Order',
    dataIndex: 'fat',
    key: 'fat',
    align: 'right'
  },
  {
    title: 'Status',
    dataIndex: 'carbs',
    key: 'carbs',
    render: (status) => <OrderStatus status={status} />
  },
  {
    title: 'Total Amount',
    dataIndex: 'protein',
    key: 'protein',
    align: 'right',
    render: (amount) => <NumericFormat value={amount} displayType="text" thousandSeparator prefix="$" />
  }
];

export default function OrderTable() {
  return (
    <AdvancedTable
      columns={columns}
      dataSource={rows}
      detailTitle={(order) => `Order #${order.tracking_no}`}
      detailItems={(order) => [
        {
          key: 'tracking_no',
          label: 'Tracking No.',
          children: order.tracking_no
        },
        {
          key: 'name',
          label: 'Product',
          children: order.name
        },
        {
          key: 'totalOrder',
          label: 'Total Order',
          children: order.fat
        },
        {
          key: 'status',
          label: 'Status',
          children: <OrderStatus status={order.carbs} />
        },
        {
          key: 'amount',
          label: 'Total Amount',
          children: <NumericFormat value={order.protein} displayType="text" thousandSeparator prefix="$" />
        }
      ]}
    />
  );
}
