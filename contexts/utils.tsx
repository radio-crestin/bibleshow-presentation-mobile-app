import {useEffect, useState} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const persistentState = (key: string, defaultValue: any) => {
    const [value, setValue] = useState(defaultValue);

    useEffect(() => {
        const loadValue = async () => {
            try {
                const savedValue = await AsyncStorage.getItem(key);
                if (savedValue) {
                    setValue(JSON.parse(savedValue));
                }
            } catch (error) {
                console.error(`Error loading ${key}:`, error);
            }
        };
        loadValue();
    }, [key]);

    const setValueAndStore = async (newValue: any) => {
        setValue(newValue);
        try {
            await AsyncStorage.setItem(key, JSON.stringify(newValue));
        } catch (error) {
            console.error(`Error saving ${key}:`, error);
        }
    };

    return [value, setValueAndStore] as const;
}