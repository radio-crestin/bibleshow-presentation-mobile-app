import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  currentReference: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  versesContainer: {
    flex: 1,
    paddingHorizontal: 16,
    position: 'relative',
  },
  versesList: {
    flex: 1,
    paddingVertical: 16,
  },
  verseSection: {
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  currentVerseSection: {
    backgroundColor: '#FFA50020',
  },
  topSection: {
    position: 'absolute',
    top: 20,
    left: 16,
    right: 16,
  },
  middleSection: {
    position: 'absolute',
    top: '50%',
    left: 16,
    right: 16,
    transform: [{ translateY: -120 }],
  },
  bottomSection: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
  },
  verseContent: {
    padding: 16,
    borderRadius: 8,
    minHeight: 80,
  },
  verseWrapper: {
    width: '100%',
  },
  webview: {
    backgroundColor: 'transparent',
    marginTop: 8,
  },
  middleVerseContainer: {
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  highlightedVerse: {
    backgroundColor: '#FFA500',
  },
  verseText: {
    width: '100%',
    textAlign: 'left',
    marginTop: 8,
    flexWrap: 'wrap',
    flexShrink: 1,
  },
  referenceText: {
    fontWeight: 'bold',
  },
  iconButton: {
    padding: 8,
  },
  rotating: {
    opacity: 0.5,
  },
  skeletonContainer: {
    backgroundColor: '#f5f5f5',
  },
  skeletonLine: {
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginVertical: 4,
  },
  skeletonTitle: {
    width: '40%',
    marginBottom: 8,
  },
});
