import {StyleSheet, View, Animated, Pressable} from 'react-native';
import {useEffect, useRef, useState} from 'react';
import {useSettings} from '@/contexts/SettingsContext';
import * as Brightness from "expo-brightness";


export function PowerSaveOverlay() {
    const {isPowerSaving, setIsPowerSaving} = useSettings();
    const opacity = useRef(new Animated.Value(0)).current;


    const [originalBrightness, setOriginalBrightness] = useState<number | null>(null);

    useEffect(() => {
        Animated.timing(opacity, {
            toValue: isPowerSaving ? 1 : 0,
            duration: 1000,
            useNativeDriver: true,
        }).start();

        const manageBrightness = async () => {
            try {
                const {status} = await Brightness.requestPermissionsAsync();
                console.log('Brightness permission status:', status);
                if (status === 'granted') {
                    if (isPowerSaving !== null) {
                        // Save current brightness before dimming if not already saved
                        if (originalBrightness === null) {
                            const currentBrightness = await Brightness.getBrightnessAsync();
                            setOriginalBrightness(currentBrightness);
                            console.log('Saved original brightness:', currentBrightness);
                        }
                        await Brightness.setBrightnessAsync(0.1);
                    } else if (originalBrightness !== null) {
                        // Restore original brightness
                        await Brightness.setBrightnessAsync(originalBrightness);
                        setOriginalBrightness(null);
                    }
                }
            } catch (error) {
                console.warn('Failed to manage brightness:', error);
            }
        };
        manageBrightness();
    }, [isPowerSaving]);

    return (
        isPowerSaving ? (
            <Pressable
                style={StyleSheet.absoluteFill}
                onPress={() => {
                    console.log('Power save overlay pressed');
                    setIsPowerSaving(null);
                }}
            >
                <Animated.View
                    style={[
                        styles.overlay,
                        {opacity},
                        styles.active
                    ]}
                />
            </Pressable>
        ) : null
    );
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'black',
        zIndex: 1000,
    },
    active: {
        elevation: 1000,
    },
});
