import {View, Pressable} from 'react-native';
import {ThemedText} from '../ThemedText';
import {styles} from './styles';
import {BibleVerse} from './types';
import {useSettings} from '@/contexts/SettingsContext';

type VerseSectionProps = {
    verse: BibleVerse,
    fontSize: number,
    isHighlighted?: boolean,
    onPress: () => void,
    colorScheme?: "light" | "dark",
    bold?: boolean
};

export function VerseSection({verse, fontSize, isHighlighted, onPress, colorScheme, bold}: VerseSectionProps) {
    const { highlightColor, verseTextColor, normalVerseBackgroundColor, normalVerseTextColor } = useSettings();

    return (
        <Pressable
            onPress={onPress}
            style={[
                styles.verseContent,
                { backgroundColor: normalVerseBackgroundColor },
                isHighlighted && {
                    ...styles.highlightedVerse,
                    backgroundColor: highlightColor,
                },
                {minHeight: Math.max(60, fontSize * 2.5)}
            ]}
        >
            <View style={styles.verseWrapper}>
                <ThemedText 
                    style={[
                        styles.referenceText, 
                        {
                            fontSize, 
                            color: isHighlighted ? verseTextColor : normalVerseTextColor,
                            fontWeight: bold ? 'bold' : 'normal'
                        }
                    ]}
                >
                    {verse.reference}
                </ThemedText>
                <ThemedText 
                    style={[
                        styles.verseText, 
                        {
                            fontSize, 
                            color: isHighlighted ? verseTextColor : normalVerseTextColor,
                            fontWeight: bold ? 'bold' : 'normal'
                        }
                    ]}
                >
                    {verse.text}
                </ThemedText>
            </View>
        </Pressable>
    );
}
