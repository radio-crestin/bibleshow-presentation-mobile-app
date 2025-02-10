import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const persistentState = <T,>(key: string, defaultValue: T) => {
    const [value, setValue] = useState<T>(defaultValue);

    useEffect(() => {
        const loadValue = async () => {
            try {
                const savedValue = await AsyncStorage.getItem(key);
                if (savedValue) {
                    try {
                        setValue(JSON.parse(savedValue) as T);
                    } catch {
                        setValue(savedValue as T);
                    }
                }
            } catch (error) {
                console.error(`Error loading ${key}:`, error);
            }
        };
        loadValue();
    }, [key]);

    const setValueAndStore = async (newValue: T) => {
        setValue(newValue);
        try {
            await AsyncStorage.setItem(key, JSON.stringify(newValue));
        } catch (error) {
            console.error(`Error saving ${key}:`, error);
        }
    };

    return [value, setValueAndStore] as const;
}
