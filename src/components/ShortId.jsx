import PropTypes from 'prop-types';
import Typography from '@mui/material/Typography';
import { Tooltip } from 'antd';

export default function ShortId({ value, start = 5, end = 4 }) {
  if (!value) return '-';

  const full = String(value);
  const short = full.length > start + end + 3 ? `${full.slice(0, start)}...${full.slice(-end)}` : full;

  return (
    <Tooltip title={full}>
      <Typography component="span" sx={{ fontFamily: 'monospace', fontSize: 12.5, fontWeight: 600 }}>
        {short}
      </Typography>
    </Tooltip>
  );
}

ShortId.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  start: PropTypes.number,
  end: PropTypes.number
};
