import React, { useState, useRef, useEffect, ElementRef } from 'react';
import { View, StyleSheet, useWindowDimensions, ScrollView, LayoutChangeEvent, Text, Pressable, GestureResponderEvent } from 'react-native';
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
  Surface,
  Button,
  ProgressBar
} from 'react-native-paper';
import Colors from '../constants/Colors';

// Rename interface
interface TourDetailsWebProps {
  title: string;
  description: string;
  videoUri: string | null;
  rating?: number | null;
  reviewCount?: number | null;
  isPreviewing?: boolean;
}

// Rename component function
export default function TourDetailsWeb({ 
  title, 
  description, 
  videoUri, 
  rating,
  reviewCount,
  isPreviewing
}: TourDetailsWebProps) {
  // Placeholder data
  const duration = "45 minutes (placeholder)";
  const location = "San Francisco, CA (sample)";
  const creator = "Sarah Johnson (sample)";
  const categories = [
    "History (sample)", 
    "Architecture (sample)", 
    "Walking (sample)"
  ];
  
  const { width: windowWidth } = useWindowDimensions();
  const isDesktop = windowWidth >= 768;

  // --- Hooks called unconditionally at the top level --- 
  const [scrollContainerWidth, setScrollContainerWidth] = useState(0);
  const [cardWidth, setCardWidth] = useState(0);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false); // State for playback status
  const videoViewRef = useRef<ElementRef<typeof VideoView> | null>(null); 
  const previousStatusRef = useRef<string | null>(null); 
  const [progress, setProgress] = useState(0); 
  const [progressBarWidth, setProgressBarWidth] = useState(0); 
  const [isSeeking, setIsSeeking] = useState(false); 
  const progressBarRef = useRef<any>(null); // Use any for ref type to allow getBoundingClientRect

  // Initialize ONE player instance unconditionally
  const player = useVideoPlayer(videoUri, player => {
    // Initialization options if needed, e.g.:
    // player.loop = true;
  });

  const stars = [1, 2, 3, 4, 5]; // Array to represent stars
  const filledStarColor = Colors.secondary;
  const emptyStarColor = Colors.outline;

  // Default display values
  const displayRating = rating ?? 0;
  const displayReviewText = !reviewCount 
    ? "No reviews yet - Be the first!" 
    : `(${reviewCount} reviews)`;

  const DESCRIPTION_TRUNCATION_LIMIT = 5; // Keep for numberOfLines prop
  const DESCRIPTION_CHAR_LIMIT = 180; // Estimate: ~35-40 chars/line * 5 lines

  // Layout Handlers
  const handleScrollContainerLayout = (event: LayoutChangeEvent) => {
    setScrollContainerWidth(event.nativeEvent.layout.width);
  };
  const handleCardLayout = (event: LayoutChangeEvent) => {
    setCardWidth(event.nativeEvent.layout.width);
  };
  
  // --- End of top-level hooks ---

  // Event listener for playing state changes (Simplified)
  useEventListener(player, 'playingChange', ({ isPlaying }: { isPlaying: boolean }) => {
    // REMOVED Complex logic, revert to simple update
    setIsVideoPlaying(isPlaying);
  });

  // Add Effect for polling currentTime (from Android)
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
      }, 100); 
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isVideoPlaying, player]); 

  // Add event listener for statusChange (from Android)
  useEventListener(player, 'statusChange', (status) => {
    const currentStatus = status?.status;
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
    previousStatusRef.current = currentStatus;
  });

  const renderStars = (size: number) => {
    return stars.map((starValue) => {
      const fullStarThreshold = starValue;
      const partialStarThreshold = starValue - 1;

      if (displayRating >= fullStarThreshold) {
        // --- Full Star --- (Use Icon)
        return (
          <View key={starValue} style={styles.starButtonContainer}>
            <Icon
              source="star" // Use source prop for Icon
              color={filledStarColor}
              size={size}
              // style={styles.starIconOnly} // Removed style for now
            />
          </View>
        );
      } else if (displayRating > partialStarThreshold) {
        // --- Partial Star --- (Use Icon)
        const fillPercentage = displayRating - partialStarThreshold;
        const filledWidth = size * fillPercentage;
        return (
          <View key={starValue} style={[styles.starButtonContainer, { width: size, height: size }]}>
            {/* Background Outline Star */}
            <Icon
              source="star-outline"
              color={emptyStarColor}
              size={size}
            />
            {/* Foreground Filled Star (clipped) */}
            <View style={[styles.starOverlayContainer, { width: filledWidth }]}>
              <Icon
                source="star"
                color={filledStarColor}
                size={size}
              />
            </View>
          </View>
        );
      } else {
        // --- Empty Star --- (Use Icon)
        return (
          <View key={starValue} style={styles.starButtonContainer}>
            <Icon
              source="star-outline"
              color={emptyStarColor}
              size={size}
            />
          </View>
        );
      }
    });
  };

  const toggleDescription = () => {
    setIsDescriptionExpanded((prev) => !prev);
  };

  // Render desktop layout for wider screens
  if (isDesktop) {
    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={true}
        contentContainerStyle={styles.desktopScrollContainer}
        onLayout={handleScrollContainerLayout}
      >
        <View style={styles.desktopOuterContainer}>
          <Card 
            style={styles.desktopContainer} 
            mode="elevated"
            onLayout={handleCardLayout}
          >
            <View style={styles.desktopLayout}>
              {/* Left column: Video/Media Section */}
              <View style={styles.desktopMediaColumn}>
                {videoUri ? (
                  <VideoView
                    player={player}
                    style={[styles.desktopVideoPlayer, { aspectRatio: 9 / 16 }]}
                    contentFit="contain"
                    nativeControls={true}
                  />
                ) : (
                  <View style={[styles.desktopVideoPlaceholder, { aspectRatio: 9 / 16 }]}>
                    <IconButton icon="video-off-outline" iconColor={Colors.textSecondary} size={64} />
                  </View>
                )}
                
                <View style={styles.desktopCategoriesContainer}>
                  {categories.map((category, index) => (
                    <Chip 
                      key={index} 
                      style={[styles.categoryChip, styles.desktopCategoryChip]}
                      textStyle={styles.categoryChipText}
                    >
                      {category}
                    </Chip>
                  ))}
                </View>
              </View>
              
              {/* Right column: Content */}
              <Card.Content style={styles.desktopContentColumn}>
                {/* Header row with title, rating, and DURATION */}
                <View style={styles.desktopHeaderRow}>
                  <View style={styles.desktopTitleContainer}>
                    <Title 
                      style={styles.desktopTitle} 
                      numberOfLines={1}
                    >
                      {title || "Untitled Tour"}
                    </Title>
                    <View style={styles.ratingContainer}>
                      {renderStars(20)}
                      <Text style={styles.desktopReviewCount}>{displayReviewText}</Text>
                    </View>
                  </View>
                  
                  <Chip style={styles.durationChip} textStyle={styles.chipText}>
                    <Text style={styles.chipText}>{duration}</Text>
                  </Chip>
                </View>
                
                {/* Info cards row */}
                <View style={styles.desktopInfoRow}>
                  <Surface style={styles.desktopInfoCard} elevation={1}>
                    <List.Item
                      title="Location"
                      description={location}
                      left={props => <List.Icon {...props} icon="map-marker" color={Colors.primary} />}
                      titleStyle={styles.desktopInfoTitle}
                      descriptionStyle={styles.desktopInfoDescription}
                    />
                  </Surface>
                  
                  <Surface style={styles.desktopInfoCard} elevation={1}>
                    <List.Item
                      title="Creator"
                      description={creator}
                      left={props => <List.Icon {...props} icon="account" color={Colors.primary} />}
                      titleStyle={styles.desktopInfoTitle}
                      descriptionStyle={styles.desktopInfoDescription}
                    />
                  </Surface>
                </View>
                
                <Divider style={styles.divider} />
                
                {/* Description Section */}
                <Title style={styles.desktopSectionTitle}>About This Tour</Title>
                <Text 
                  style={styles.desktopDescription} 
                  numberOfLines={isDescriptionExpanded ? undefined : DESCRIPTION_TRUNCATION_LIMIT}
                >
                  {description || "No description available."}
                </Text>
                {(isDescriptionExpanded || (!isDescriptionExpanded && description && description.length > DESCRIPTION_CHAR_LIMIT)) && (
                  <Button 
                    mode="text" 
                    onPress={toggleDescription} 
                    style={styles.readMoreButton}
                    labelStyle={styles.readMoreButtonLabel}
                  >
                    {isDescriptionExpanded ? "Show less" : "Read more"}
                  </Button>
                )}
                
                {/* Action Button */}
                <Button 
                  mode="contained" 
                  style={[
                    styles.desktopBookButton,
                    isPreviewing && { opacity: 1 }
                  ]}
                  buttonColor={Colors.primary}
                  labelStyle={styles.desktopButtonLabel}
                  disabled={isPreviewing}
                >
                  Start Tour
                </Button>
              </Card.Content>
            </View>
          </Card>
        </View>
      </ScrollView>
    );
  }
  
  // Mobile layout (default)
  return (
    <Card style={styles.mobileContainer} mode="elevated">
      {/* Media container now holds overlay and video */}
      <View style={styles.mobileMediaContainer}>
        {/* Video Player and Pressable Wrapper */}  
        {videoUri ? (
          <>
            <VideoView
              ref={videoViewRef}
              player={player}
              style={styles.mobileVideoPlayer}
              contentFit="contain"
              nativeControls={false}
            />
            {/* Pause Touchable Area - Copied from Android */}
            <Pressable 
              style={styles.pauseTouchable}
              onPress={() => {
                if (isVideoPlaying) {
                  player.pause();
                }
              }}
            />
            {/* Progress Bar Area - Copied from Android */}
            <Pressable
              ref={progressBarRef}
              style={styles.progressBarTouchable}
              onLayout={(event) => {
                setProgressBarWidth(event.nativeEvent.layout.width);
              }}
              onPress={(event: GestureResponderEvent) => {
                if (progressBarRef.current && progressBarWidth > 0 && player && player.duration > 0) {
                  const rect = progressBarRef.current.getBoundingClientRect();
                  const clientX = (event as unknown as MouseEvent).clientX;
                  if (typeof clientX === 'number') {
                    const pressLocationX = clientX - rect.left;
                    const proportion = pressLocationX / progressBarWidth;
                    const targetTime = proportion * player.duration;
                    if (isFinite(targetTime)) {
                      try {
                        setIsSeeking(true); 
                        const clampedTime = Math.max(0, Math.min(targetTime, player.duration));
                        player.currentTime = clampedTime;

                        // Add setTimeout to resync state (like iOS)
                        setTimeout(() => {
                          if (player) {
                             setIsVideoPlaying(player.playing);
                          }
                          setIsSeeking(false);
                        }, 150); 

                      } catch (e: any) {
                        console.error("Error setting currentTime on progress bar press:", e);
                      }
                    } else {
                      console.error(`[Web Seek Press] Calculated targetTime is not finite: ${targetTime}`);
                    }
                  } else {
                    console.error("[Web Seek Press] event.clientX is not available.");
                  }
                }
              }}
            >
              <ProgressBar 
                progress={progress} 
                color={Colors.secondary} 
                style={styles.progressBarVisual}
              />
            </Pressable>
          </>
        ) : (
          <View style={styles.mobileVideoPlaceholder}>
             <IconButton icon="video-off-outline" iconColor={Colors.textSecondary} size={50} />
          </View>
        )}

        {/* --- Overlays shown only when video is NOT playing AND not seeking --- */}
        { !isVideoPlaying && !isSeeking && (
          <>
            {/* Information Overlay */} 
            <LinearGradient 
              colors={['rgba(0,0,0,0.5)', 'transparent']} // Subtle gradient from top
              style={styles.mobileInfoOverlay}
            >
              {/* Title Row */}
              <View style={styles.titleRowMobileOverlay}>
                <Title style={styles.mobileTitleOverlay}>{title || "Untitled Tour"}</Title>
              </View>
              {/* Duration Chip */}
              <Chip style={styles.durationChipMobileOverlay} textStyle={styles.chipTextOverlay}>
                <Text style={styles.chipTextOverlay}>{duration}</Text>
              </Chip>
              {/* Rating Section */}
              <View style={styles.ratingContainerMobileOverlay}>
                 {renderStars(18)}
                 <Text style={styles.reviewCountOverlay}>{displayReviewText}</Text>
              </View>
            </LinearGradient>

            {/* Categories Overlay */}
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

            {/* Play Button Overlay */} 
            <View style={styles.playButtonContainer}>
              <IconButton
                icon="play-circle-outline"
                iconColor={Colors.background}
                size={80}
                onPress={() => player.play()}
                style={styles.playButton}
              />
            </View>
          </>
        )}
        {/* --- End of overlays for paused state --- */} 
        
      </View>
      
      {/* Content below video */}
      <Card.Content style={styles.mobileContent}>
        {/* Tour Details */}
        <List.Section>
          <List.Item
            title="Location"
            description={location}
            left={props => <List.Icon {...props} icon="map-marker" color={Colors.primary} />}
            titleStyle={styles.listTitle}
            descriptionStyle={styles.listDescription}
            style={styles.listItem}
          />
          <List.Item
            title="Creator"
            description={creator}
            left={props => <List.Icon {...props} icon="account" color={Colors.primary} />}
            titleStyle={styles.listTitle}
            descriptionStyle={styles.listDescription}
            style={styles.listItem}
          />
        </List.Section>
        
        <Divider style={styles.divider} />
        
        {/* Description Section */}
        <Title style={styles.sectionTitle}>About This Tour</Title>
        <Text 
          style={styles.description} 
          numberOfLines={isDescriptionExpanded ? undefined : DESCRIPTION_TRUNCATION_LIMIT}
        >
          {description || "No description available."}
        </Text>
        {(isDescriptionExpanded || (!isDescriptionExpanded && description && description.length > DESCRIPTION_CHAR_LIMIT)) && (
          <Button 
            mode="text" 
            onPress={toggleDescription} 
            style={styles.readMoreButton} 
            labelStyle={styles.readMoreButtonLabel}
          >
            {isDescriptionExpanded ? "Show less" : "Read more"}
          </Button>
        )}
        
        {/* Action Button */}
        <Button 
          mode="contained" 
          style={[
            styles.bookButton,
            isPreviewing && { opacity: 1 }
          ]}
          buttonColor={Colors.primary}
          disabled={isPreviewing}
        >
          Start Tour
        </Button>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  // Shared styles
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
  playButton: {
    // Removed background color here, applied to container
    // Removed borderRadius, default circle icon is fine
  },
  durationChip: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignSelf: 'flex-start',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  chipText: {
    color: Colors.background,
    fontSize: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
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
  reviewCount: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 8,
  },
  categoryChip: {
    backgroundColor: Colors.primaryLight,
    marginTop: 4,
    marginBottom: 4,
  },
  desktopCategoryChip: {
    marginRight: 8,
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
  },

  // Mobile-specific styles
  mobileContainer: {
    marginVertical: 8,
    backgroundColor: Colors.background,
    borderRadius: 12,
    overflow: 'hidden',
  },
  mobileMediaContainer: {
    backgroundColor: Colors.outline,
    position: 'relative',
    width: '100%',
    aspectRatio: 9 / 16,
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
    top: 0, left: 0, right: 0, bottom: 0,
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
    backgroundColor: 'rgba(58, 96, 103, 0.7)', // Semi-transparent Colors.primaryDark
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
    bottom: 16,
  },
  mobileContent: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },

  // Desktop-specific styles
  desktopScrollContainer: {
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
  desktopOuterContainer: {
    width: '100%',
    paddingHorizontal: 16,
  },
  desktopContainer: {
    marginVertical: 24,
    backgroundColor: Colors.background,
    borderRadius: 12,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 1200,
    minWidth: 700,
  },
  desktopLayout: {
    flexDirection: 'row',
    minHeight: 500,
  },
  desktopMediaColumn: {
    width: 380,
    position: 'relative',
  },
  desktopContentColumn: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 32,
    paddingBottom: 16,
  },
  desktopVideoPlayer: {
    width: '100%',
    backgroundColor: Colors.outline,
    maxHeight: 600,
  },
  desktopVideoPlaceholder: {
    width: '100%',
    backgroundColor: Colors.outline,
    justifyContent: 'center',
    alignItems: 'center',
    maxHeight: 600,
  },
  desktopHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  desktopTitleContainer: {
    flex: 1,
    marginRight: 24,
  },
  desktopTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primaryDark,
    marginBottom: 16,
  },
  desktopRatingText: {
    // This style is no longer used for rating number, keep for review count consistency if needed
    // Or remove if desktopReviewCount is styled separately
  },
  desktopReviewCount: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginLeft: 12,
  },
  desktopInfoRow: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  desktopInfoCard: {
    flex: 1,
    marginRight: 16,
    borderRadius: 8,
    backgroundColor: Colors.background,
    overflow: 'hidden',
  },
  desktopInfoTitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  desktopInfoDescription: {
    fontSize: 18,
    color: Colors.text,
    fontWeight: '500',
  },
  desktopCategoriesContainer: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    zIndex: 10,
  },
  desktopSectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.primaryDark,
    marginBottom: 16,
  },
  desktopDescription: {
    fontSize: 18,
    lineHeight: 28,
    color: Colors.text,
    marginBottom: 8,
    maxWidth: 720,
  },
  desktopBookButton: {
    marginTop: 8,
    borderRadius: 8,
    paddingVertical: 4,
    width: '50%',
    alignSelf: 'center',
  },
  desktopButtonLabel: {
    fontSize: 18,
    paddingVertical: 4,
  },
  // Add styles copied from Android
  pauseTouchable: { 
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 20, 
  },
  progressBarTouchable: { 
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 20, 
  },
  progressBarVisual: { 
    width: '100%',
    height: 4, 
    position: 'absolute',
    bottom: 0,
  },
}); 