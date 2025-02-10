import {View, Pressable} from 'react-native';
import {ThemedText} from '../ThemedText';
import {styles} from './styles';
import {BibleVerse} from './types';

type VerseSectionProps = {
    verse: BibleVerse,
    fontSize: number,
    isHighlighted?: boolean,
    onPress: () => void,
    colorScheme?: "light" | "dark"
};

export function VerseSection({verse, fontSize, isHighlighted, onPress, colorScheme}: VerseSectionProps) {

    return (
        <Pressable
            onPress={onPress}
            style={[
                styles.verseContent,
                isHighlighted && {
                    ...styles.highlightedVerse,
                    backgroundColor: colorScheme == 'light'? '#FFA500': '#d96500',
                },
                {minHeight: Math.max(60, fontSize * 2.5)}
            ]}
        >
            <View style={styles.verseWrapper}>
                <ThemedText style={[styles.referenceText, {fontSize}]}>{verse.reference}</ThemedText>
                <ThemedText style={[styles.verseText, {fontSize}]}>{verse.text}</ThemedText>
            </View>
        </Pressable>
    );
}
