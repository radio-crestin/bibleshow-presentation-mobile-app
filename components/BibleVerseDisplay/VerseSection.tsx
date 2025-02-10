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
    colorScheme?: "light" | "dark"
};

export function VerseSection({verse, fontSize, isHighlighted, onPress, colorScheme}: VerseSectionProps) {
    const { highlightColor, verseTextColor } = useSettings();

    return (
        <Pressable
            onPress={onPress}
            style={[
                styles.verseContent,
                isHighlighted && {
                    ...styles.highlightedVerse,
                    backgroundColor: highlightColor,
                },
                {minHeight: Math.max(60, fontSize * 2.5)}
            ]}
        >
            <View style={styles.verseWrapper}>
                <ThemedText style={[styles.referenceText, {fontSize, color: verseTextColor}]}>{verse.reference}</ThemedText>
                <ThemedText style={[styles.verseText, {fontSize, color: verseTextColor}]}>{verse.text}</ThemedText>
            </View>
        </Pressable>
    );
}
