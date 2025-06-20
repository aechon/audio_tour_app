import React, { useState, useRef, useEffect, ElementRef } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Pressable,
} from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useEventListener } from 'expo';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Card,
  Title,
  Chip,
  Divider,
  List,
  IconButton,
  Icon,
  Button,
  ProgressBar,
} from 'react-native-paper';
import Colors from '../constants/Colors';

// Props specific to Android details view
interface TourDetailsAndroidProps {
  title: string;
  description: string;
  videoUri: string | null;
  rating?: number | null;
  reviewCount?: number | null;
  isPreviewing?: boolean;
}

export default function TourDetailsAndroid({
  title,
  description,
  videoUri,
  rating,
  reviewCount,
  isPreviewing, // Note: isPreviewing might be used differently or not at all on Android
}: TourDetailsAndroidProps) {
  // Placeholder data (keep or fetch as needed)
  const duration = '45 minutes (placeholder)';
  const location = 'San Francisco, CA (sample)';
  const creator = 'Sarah Johnson (sample)';
  const categories = [
    'History (sample)',
    'Architecture (sample)',
    'Walking (sample)',
  ];

  // --- Hooks ---
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoViewRef = useRef<ElementRef<typeof VideoView> | null>(null);
  const previousStatusRef = useRef<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressBarWidth, setProgressBarWidth] = useState(0); // State for width
  const [isSeeking, setIsSeeking] = useState(false); // State for seeking

  // Video Player Setup - remove empty initializer
  const player = useVideoPlayer(videoUri);

  // Event listener for playing state changes (to update isVideoPlaying)
  useEventListener(player, 'playingChange', ({ isPlaying }: { isPlaying: boolean }) => {
    // If the player is stopping and we know we initiated a seek,
    // ignore this 'false' state update for isVideoPlaying.
    // Just reset the seeking flag.
    if (!isPlaying && isSeeking) {
      setIsSeeking(false);
      // DO NOT call setIsVideoPlaying(false) here
    } else {
      // Otherwise (if playing started, or if it stopped for a non-seek reason),
      // update isVideoPlaying normally.
      // Also reset isSeeking if it happened to be true (e.g., playing started after seek).
      if (isSeeking) {
          setIsSeeking(false);
      }
      setIsVideoPlaying(isPlaying);
    }
  });

  // Effect for polling currentTime while playing
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (isVideoPlaying && player) {
      intervalId = setInterval(() => {
        const currentTime = player.currentTime ?? 0;
        const duration = player.duration ?? 0;
        if (duration > 0) {
          setProgress(currentTime / duration);
        } else {
          setProgress(0);
        }
      }, 100); // Poll every 100ms
    }

    // Cleanup function to clear interval on unmount or when isVideoPlaying changes to false
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isVideoPlaying, player]); // Dependencies: run when playing state or player changes

  // Restore event listener to reset video when playback finishes using currentTime
  useEventListener(player, 'statusChange', (status) => {
    const currentStatus = status?.status;

    // Check if status transitioned from readyToPlay to idle
    if (currentStatus === 'idle' && previousStatusRef.current === 'readyToPlay') {
      if (player) { 
         try {
           player.pause(); 
           player.currentTime = 0; 
         } catch (e: any) { 
            console.error("Error pausing or setting currentTime:", e);
         }
      }
    }
    // Update previous status ref
    previousStatusRef.current = currentStatus;
  });

  // Star rendering logic (copied)
  const stars = [1, 2, 3, 4, 5];
  const filledStarColor = Colors.secondary;
  const emptyStarColor = Colors.outline;
  const displayRating = rating ?? 0;
  const displayReviewText = !reviewCount
    ? 'No reviews yet - Be the first!'
    : `(${reviewCount} reviews)`;

  const renderStars = (size: number) => {
    return stars.map((starValue) => {
      const fullStarThreshold = starValue;
      const partialStarThreshold = starValue - 1;

      if (displayRating >= fullStarThreshold) {
        return (
          <View key={starValue} style={styles.starButtonContainer}>
            <Icon source="star" color={filledStarColor} size={size} />
          </View>
        );
      } else if (displayRating > partialStarThreshold) {
        const fillPercentage = displayRating - partialStarThreshold;
        const filledWidth = size * fillPercentage;
        return (
          <View
            key={starValue}
            style={[styles.starButtonContainer, { width: size, height: size }]}
          >
            <Icon source="star-outline" color={emptyStarColor} size={size} />
            <View style={[styles.starOverlayContainer, { width: filledWidth }]}>
              <Icon source="star" color={filledStarColor} size={size} />
            </View>
          </View>
        );
      } else {
        return (
          <View key={starValue} style={styles.starButtonContainer}>
            <Icon source="star-outline" color={emptyStarColor} size={size} />
          </View>
        );
      }
    });
  };

  // Description toggle (copied)
  const DESCRIPTION_TRUNCATION_LIMIT = 5;
  const DESCRIPTION_CHAR_LIMIT = 180;
  const toggleDescription = () => {
    setIsDescriptionExpanded((prev) => !prev);
  };

  // --- Component Return (Mobile Layout Only) ---
  // This layout is largely reused from iOS for now. Android specific tweaks can go here.
  return (
    <Card style={styles.mobileContainer} mode="elevated" elevation={0}>
      {/* Inner wrapper View START */}
      <View style={styles.cardInnerWrapper}> 
        
        {/* Media container */}
        <View style={styles.mobileMediaContainer}>
          {videoUri ? (
            <>
              <VideoView
                ref={videoViewRef}
                player={player}
                style={styles.mobileVideoPlayer}
                contentFit="cover"
                nativeControls={false}
              />
              <Pressable
                style={styles.pauseTouchable}
                onPress={() => {
                  if (isVideoPlaying) {
                    player.pause();
                  }
                }}
              />

              {/* Progress Bar Area (Pressable Wrapper + ProgressBar) */}
              <Pressable
                style={styles.progressBarTouchable} // Use a dedicated style
                onLayout={(event) => {
                  setProgressBarWidth(event.nativeEvent.layout.width);
                }}
                onPress={(event) => {
                  if (progressBarWidth > 0 && player && player.duration > 0) {
                    const pressLocationX = event.nativeEvent.locationX;
                    const proportion = pressLocationX / progressBarWidth;
                    const targetTime = proportion * player.duration;
                    try {
                      setIsSeeking(true); 
                      const clampedTime = Math.max(0, Math.min(targetTime, player.duration));
                      player.currentTime = clampedTime;
                    } catch (e: any) {
                      console.error("Error setting currentTime on progress bar press:", e);
                    }
                  }
                }}
              >
                <ProgressBar 
                  progress={progress} 
                  color={Colors.secondary} 
                  style={styles.progressBarVisual} // Style for visual part only
                />
              </Pressable>
            </>
          ) : (
            <View style={styles.mobileVideoPlaceholder}>
              <IconButton
                icon="video-off-outline"
                iconColor={Colors.textSecondary}
                size={50}
              />
            </View>
          )}

          {/* Info Overlays (only when not playing AND not seeking) */}
          { !isVideoPlaying && !isSeeking && (
            <>
              <LinearGradient
                colors={['rgba(0,0,0,0.5)', 'transparent']}
                style={styles.mobileInfoOverlay}
              >
                <View style={styles.titleRowMobileOverlay}>
                  <Title style={styles.mobileTitleOverlay}>
                    {title || 'Untitled Tour'}
                  </Title>
                </View>
                <Chip
                  style={styles.durationChipMobileOverlay}
                  textStyle={styles.chipTextOverlay}
                >
                  <Text style={styles.chipTextOverlay}>{duration}</Text>
                </Chip>
                <View style={styles.ratingContainerMobileOverlay}>
                  {renderStars(18)}
                  <Text style={styles.reviewCountOverlay}>{displayReviewText}</Text>
                </View>
              </LinearGradient>

              <View style={styles.mobileCategoriesContainer}>
                {categories.map((category, index) => (
                  <Chip
                    key={index}
                    style={styles.categoryChip}
                    textStyle={styles.categoryChipText}
                  >
                    {category}
                  </Chip>
                ))}
              </View>

              <View style={styles.playButtonContainer}>
                <IconButton
                  icon={"play-circle-outline"}
                  iconColor={Colors.background}
                  size={80}
                  onPress={() => {
                    player.play();
                  }}
                  style={styles.playButton}
                />
              </View>
            </>
          )}
        </View>

        {/* Content below video */}
        <Card.Content style={styles.mobileContent}>
          <List.Section>
            <List.Item
              title="Location"
              description={location}
              left={(props) => (
                <List.Icon {...props} icon="map-marker" color={Colors.primary} />
              )}
              titleStyle={styles.listTitle}
              descriptionStyle={styles.listDescription}
              style={styles.listItem}
            />
            <List.Item
              title="Creator"
              description={creator}
              left={(props) => (
                <List.Icon {...props} icon="account" color={Colors.primary} />
              )}
              titleStyle={styles.listTitle}
              descriptionStyle={styles.listDescription}
              style={styles.listItem}
            />
          </List.Section>

          <Divider style={styles.divider} />

          <Title style={styles.sectionTitle}>About This Tour</Title>
          <Text
            style={styles.description}
            numberOfLines={
              isDescriptionExpanded ? undefined : DESCRIPTION_TRUNCATION_LIMIT
            }
          >
            {description || 'No description available.'}
          </Text>
          {(isDescriptionExpanded ||
            (!isDescriptionExpanded &&
              description &&
              description.length > DESCRIPTION_CHAR_LIMIT)) && (
            <Button
              mode="text"
              onPress={toggleDescription}
              style={styles.readMoreButton}
              labelStyle={styles.readMoreButtonLabel}
            >
              {isDescriptionExpanded ? 'Show less' : 'Read more'}
            </Button>
          )}

          {/* Previewing prop might control button behavior/text */}
          {isPreviewing ? (
            <View style={[styles.bookButton, { backgroundColor: Colors.primary }]}>
              <Text style={styles.bookButtonLabel}>Start Tour</Text>
            </View>
          ) : (
            <Button
              mode="contained"
              style={styles.bookButton}
              buttonColor={Colors.primary}
              onPress={() => console.log("Start Tour Pressed")}
            >
              Start Tour
            </Button>
          )}
        </Card.Content>

      </View>
    </Card>
  );
}

// Styles (Copied and cleaned up mobile-related styles from TourDetailsiOS)
// These styles can be adjusted for Android-specific look and feel later.
const styles = StyleSheet.create({
  // Shared styles needed by mobile view
  playButtonContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(58, 96, 103, 0.5)', // Semi-transparent Colors.primaryDark
  },
  progressBar: { // Style for the progress bar - Correctly placed
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4, // Adjust height as needed
  },
  progressBarTouchable: { // Style for the Pressable wrapper
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 20, // Make touch target larger than visual bar
    justifyContent: 'flex-end', // Align visual bar at the bottom
  },
  progressBarVisual: { // Style for the visual ProgressBar itself
    width: '100%',
    height: 4, // Visual height remains small
  },
  playButton: {},
  starButtonContainer: {
    marginRight: 2,
    position: 'relative',
  },
  starOverlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    overflow: 'hidden',
  },
  categoryChip: {
    backgroundColor: Colors.primaryLight,
    marginTop: 4,
    marginBottom: 4,
  },
  categoryChipText: {
    color: Colors.background,
  },
  divider: {
    backgroundColor: Colors.outline,
    height: 1,
    marginVertical: 16,
  },
  listTitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  listDescription: {
    fontSize: 16,
    color: Colors.text,
  },
  listItem: {
    paddingLeft: 0,
    paddingRight: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primaryDark,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.text,
    marginBottom: 8,
  },
  readMoreButton: {
    alignSelf: 'flex-start',
    marginTop: 0,
    marginBottom: 16,
  },
  readMoreButtonLabel: {
    fontSize: 14,
    marginHorizontal: 0,
    color: Colors.primary,
  },
  bookButton: {
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookButtonLabel: {
    color: Colors.background,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },

  // Mobile-specific styles (from TourDetailsiOS)
  mobileContainer: {
    backgroundColor: Colors.background,
  },
  cardInnerWrapper: {
    overflow: 'hidden',
  },
  mobileMediaContainer: {
    backgroundColor: Colors.outline,
    position: 'relative',
    width: '100%',
    aspectRatio: 10 / 16, // Adjusted from 9/16 to make it slightly shorter
  },
  mobileVideoPlayer: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
  mobileVideoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.outline,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  mobileInfoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: 24,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  titleRowMobileOverlay: {
    marginBottom: 4,
  },
  mobileTitleOverlay: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.background,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    flex: 1,
  },
  durationChipMobileOverlay: {
    backgroundColor: 'rgba(58, 96, 103, 0.7)',
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  chipTextOverlay: {
    color: Colors.background,
    fontSize: 12,
  },
  ratingContainerMobileOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewCountOverlay: {
    fontSize: 14,
    color: Colors.background,
    marginLeft: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  mobileCategoriesContainer: {
    flexDirection: 'column',
    position: 'absolute',
    right: 8,
    zIndex: 10,
    alignItems: 'flex-end',
    bottom: 12,
  },
  mobileContent: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  pauseTouchable: { // Style for the main pause touch area
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 20, // Stops above the progressBarTouchable area (height 20)
    // backgroundColor: 'rgba(255,0,0,0.2)', // Optional: for debugging touch area
  },
}); 