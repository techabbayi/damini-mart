import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import * as Updates from 'expo-updates';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export default function UpdateChecker() {
    const [updateAvailable, setUpdateAvailable] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        checkForUpdates();
    }, []);

    const checkForUpdates = async () => {
        if (__DEV__) return; // Skip in development

        try {
            const update = await Updates.checkForUpdateAsync();
            if (update.isAvailable) {
                setUpdateAvailable(true);
            }
        } catch (error) {
            console.log('Error checking for updates:', error);
        }
    };

    const handleUpdate = async () => {
        if (__DEV__) return;

        try {
            setIsUpdating(true);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            await Updates.fetchUpdateAsync();
            await Updates.reloadAsync();
        } catch (error) {
            console.log('Error updating:', error);
            setIsUpdating(false);
        }
    };

    if (!updateAvailable) return null;

    return (
        <View style={styles.container}>
            <View style={styles.banner}>
                <Ionicons name="download-outline" size={24} color="#fff" />
                <View style={styles.textContainer}>
                    <Text style={styles.title}>New Update Available!</Text>
                    <Text style={styles.subtitle}>Tap to update now</Text>
                </View>
                <TouchableOpacity
                    style={styles.button}
                    onPress={handleUpdate}
                    disabled={isUpdating}
                >
                    {isUpdating ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <Text style={styles.buttonText}>Update</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
    },
    banner: {
        backgroundColor: '#10b981',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        paddingTop: 50,
        gap: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    subtitle: {
        color: '#f0fdf4',
        fontSize: 12,
        marginTop: 2,
    },
    button: {
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        minWidth: 80,
        alignItems: 'center',
    },
    buttonText: {
        color: '#10b981',
        fontSize: 14,
        fontWeight: '600',
    },
});
