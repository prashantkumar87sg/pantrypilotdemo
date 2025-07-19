import React from 'react';
import { useSelector } from 'react-redux';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Chip,
} from '@mui/material';
import {
  ShoppingCart,
  Warning,
  CheckCircle,
  TrendingUp,
} from '@mui/icons-material';

const QuickStats = () => {
  const { activeItems, restockedItems } = useSelector(state => state.items);

  const criticalItems = activeItems.filter(item => item.urgency === 'critical').length;
  const mediumItems = activeItems.filter(item => item.urgency === 'medium').length;
  const lowItems = activeItems.filter(item => item.urgency === 'low').length;

  const stats = [
    {
      label: 'Total Items',
      value: activeItems.length,
      icon: <ShoppingCart color="primary" />,
      color: 'primary.main',
    },
    {
      label: 'Critical',
      value: criticalItems,
      icon: <Warning color="error" />,
      color: 'error.main',
    },
    {
      label: 'Medium',
      value: mediumItems,
      icon: <Warning color="warning" />,
      color: 'warning.main',
    },
    {
      label: 'Restocked',
      value: restockedItems.length,
      icon: <CheckCircle color="success" />,
      color: 'success.main',
    },
  ];

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" component="h3" sx={{ mb: 3, fontWeight: 600 }}>
          Quick Stats
        </Typography>
        
        <Grid container spacing={2}>
          {stats.map((stat, index) => (
            <Grid item xs={6} key={index}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  p: 2,
                  backgroundColor: 'background.default',
                  borderRadius: 2,
                  gap: 1,
                }}
              >
                {stat.icon}
                <Box>
                  <Typography variant="h6" component="div" sx={{ fontWeight: 600, color: stat.color }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {stat.label}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>

        {activeItems.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Urgency Breakdown
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {criticalItems > 0 && (
                <Chip
                  label={`${criticalItems} Critical`}
                  size="small"
                  color="error"
                  variant="outlined"
                />
              )}
              {mediumItems > 0 && (
                <Chip
                  label={`${mediumItems} Medium`}
                  size="small"
                  color="warning"
                  variant="outlined"
                />
              )}
              {lowItems > 0 && (
                <Chip
                  label={`${lowItems} Low`}
                  size="small"
                  color="success"
                  variant="outlined"
                />
              )}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default QuickStats; 