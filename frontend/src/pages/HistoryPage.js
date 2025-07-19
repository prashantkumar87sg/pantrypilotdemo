import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
} from '@mui/material';
import { History } from '@mui/icons-material';

const HistoryPage = () => {
  return (
    <Box sx={{ maxWidth: '100%', mx: 'auto' }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3, fontWeight: 600 }}>
        History
      </Typography>
      
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <History sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Purchase history coming soon
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This will show all restocked items and shopping patterns
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default HistoryPage; 