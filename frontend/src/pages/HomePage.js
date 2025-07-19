import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  IconButton,
  Chip,
  LinearProgress,
  useTheme,
  useMediaQuery,
  Stack,
  Avatar,
} from '@mui/material';
import {
  Mic,
  MicOff,
  PlayArrow,
  Stop,
  Add,
  ShoppingCart,
  History,
  TrendingUp,
} from '@mui/icons-material';

import PushToRecordButton from '../components/audio/PushToRecordButton';
import RecentItems from '../components/items/RecentItems';
import QuickStats from '../components/dashboard/QuickStats';
import { openAddItemModal } from '../store/slices/uiSlice';

const HomePage = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { activeItems, processingAudio, lastExtractedItems } = useSelector(state => state.items);
  const { isRecording, transcription, isTranscribing } = useSelector(state => state.audio);

  const handleAddManualItem = () => {
    dispatch(openAddItemModal());
  };

  return (
    <Box sx={{ maxWidth: '100%', mx: 'auto', px: { xs: 1, sm: 2 } }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(45deg, #2196f3 30%, #4caf50 90%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1,
          }}
        >
          PantryPilot
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          Voice-powered pantry management
        </Typography>
      </Box>

      {/* Main Push-to-Record Interface */}
      <Card
        sx={{
          mb: 4,
          background: 'linear-gradient(135deg, #2196f3 0%, #4caf50 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 4 }, textAlign: 'center' }}>
          <Box sx={{ position: 'relative', zIndex: 2 }}>
            <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 600 }}>
              Quick Voice Recording
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, opacity: 0.9 }}>
              Click the microphone to start recording what's running low
            </Typography>

            {/* Push to Record Button */}
            <PushToRecordButton />

            {/* Recording Status */}
            {isRecording && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" sx={{ mb: 1, opacity: 0.9 }}>
                  🎤 Recording... Release to stop
                </Typography>
                <LinearProgress
                  sx={{
                    backgroundColor: 'rgba(255,255,255,0.3)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: 'white',
                    },
                  }}
                />
              </Box>
            )}

            {/* Transcription Display */}
            {transcription && (
              <Box sx={{ mt: 3, p: 2, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                <Typography variant="body2" sx={{ mb: 1, opacity: 0.8 }}>
                  Transcription:
                </Typography>
                <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                  "{transcription}"
                </Typography>
              </Box>
            )}

            {/* Processing Status */}
            {(isTranscribing || processingAudio) && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" sx={{ mb: 1, opacity: 0.9 }}>
                  {isTranscribing ? '🎯 Converting speech to text...' : '🤖 AI processing your items...'}
                </Typography>
                <LinearProgress
                  sx={{
                    backgroundColor: 'rgba(255,255,255,0.3)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: 'white',
                    },
                  }}
                />
              </Box>
            )}

            {/* Recently Extracted Items */}
            {lastExtractedItems.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
                  ✅ Just added to your list:
                </Typography>
                <Stack direction="row" spacing={1} sx={{ justifyContent: 'center', flexWrap: 'wrap' }}>
                  {lastExtractedItems.map((item, index) => (
                    <Chip
                      key={index}
                      label={item.name}
                      size="small"
                      sx={{
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        mb: 1,
                      }}
                    />
                  ))}
                </Stack>
              </Box>
            )}
          </Box>

          {/* Background Decoration */}
          <Box
            sx={{
              position: 'absolute',
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.1)',
              zIndex: 1,
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: -30,
              left: -30,
              width: 150,
              height: 150,
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.05)',
              zIndex: 1,
            }}
          />
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={6} sm={3}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<Add />}
            onClick={handleAddManualItem}
            sx={{ py: 2, borderRadius: 3 }}
          >
            Add Item
          </Button>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<ShoppingCart />}
            href="/shopping-list"
            sx={{ py: 2, borderRadius: 3 }}
          >
            View List
          </Button>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<History />}
            href="/history"
            sx={{ py: 2, borderRadius: 3 }}
          >
            History
          </Button>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<TrendingUp />}
            sx={{ py: 2, borderRadius: 3 }}
          >
            Insights
          </Button>
        </Grid>
      </Grid>

      {/* Dashboard Content */}
      <Grid container spacing={3}>
        {/* Quick Stats */}
        <Grid item xs={12} md={4}>
          <QuickStats />
        </Grid>

        {/* Recent Items */}
        <Grid item xs={12} md={8}>
          <RecentItems />
        </Grid>
      </Grid>
    </Box>
  );
};

export default HomePage; 