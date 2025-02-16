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
                {
                    backgroundColor: normalVerseBackgroundColor,
                    borderWidth: 1.5
                },
                isHighlighted && {
                    ...styles.highlightedVerse,
                    backgroundColor: highlightColor,
                    borderColor: verseTextColor,
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
                            fontWeight: bold ? 'bold' : 'normal',
                            flex: 1,
                            justifyContent: "center",
                            alignItems: "center",
                        }
                    ]}
                >
                    {verse.reference}
                {/*    <ThemedText style={{*/}
                {/*        fontSize: fontSize * 0.6,*/}
                {/*        marginLeft: 4,*/}
                {/*        paddingBottom: 40*/}
                {/*}}>{isHighlighted? "🟢": ""}</ThemedText>*/}

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
