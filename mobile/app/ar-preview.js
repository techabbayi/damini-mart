import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Camera, CameraType } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

export default function ARPreview() {
    const insets = useSafeAreaInsets();
    const { productId, productName } = useLocalSearchParams();
    const [hasPermission, setHasPermission] = useState(null);
    const [type, setType] = useState(CameraType.back);
    const [isARActive, setIsARActive] = useState(false);
    const cameraRef = useRef(null);

    useEffect(() => {
        (async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
            
            if (status !== 'granted') {
                Alert.alert(
                    'Camera Permission Required',
                    'LocalBazar needs camera access to show AR preview. You can change this in settings.',
                    [
                        { text: 'Cancel', onPress: () => router.back() },
                        { text: 'Settings', onPress: () => {/* Open settings */} }
                    ]
                );
            }
        })();
    }, []);

    const toggleAR = () => {
        setIsARActive(!isARActive);
    };

    const flipCamera = () => {
        setType(current => 
            current === CameraType.back ? CameraType.front : CameraType.back
        );
    };

    const capturePhoto = async () => {
        if (cameraRef.current) {
            try {
                const photo = await cameraRef.current.takePictureAsync();
                Alert.alert('Photo Captured', 'AR preview photo saved!');
            } catch (error) {
                console.error('Capture error:', error);
            }
        }
    };

    if (hasPermission === null) {
        return (
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <Stack.Screen options={{ headerShown: false }} />
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Requesting camera permission...</Text>
                </View>
            </View>
        );
    }

    if (hasPermission === false) {
        return (
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <Stack.Screen options={{ headerShown: false }} />
                <View style={styles.noAccessContainer}>
                    <Ionicons name="camera-off" size={80} color="#ef4444" />
                    <Text style={styles.noAccessText}>Camera Access Denied</Text>
                    <Text style={styles.noAccessSubtext}>
                        Enable camera permission in settings to use AR preview
                    </Text>
                    <TouchableOpacity 
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.backButtonText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <Stack.Screen options={{ headerShown: false }} />
            
            {/* Camera View */}
            <Camera 
                style={styles.camera} 
                type={type}
                ref={cameraRef}
            >
                {/* Top Bar */}
                <View style={[styles.topBar, { paddingTop: insets.top + 10 }]}>
                    <TouchableOpacity 
                        style={styles.topButton}
                        onPress={() => router.back()}
                    >
                        <Ionicons name="close" size={28} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.topCenter}>
                        <Text style={styles.productNameText}>{productName || 'AR Preview'}</Text>
                        <View style={[styles.arBadge, isARActive && styles.arBadgeActive]}>
                            <Text style={styles.arBadgeText}>
                                {isARActive ? 'AR ON' : 'AR OFF'}
                            </Text>
                        </View>
                    </View>
                    <View style={{ width: 44 }} />
                </View>

                {/* AR Overlay Instructions */}
                {isARActive && (
                    <View style={styles.arOverlay}>
                        <View style={styles.arCrosshair}>
                            <View style={styles.crosshairLine} />
                            <View style={[styles.crosshairLine, styles.crosshairLineVertical]} />
                        </View>
                        <Text style={styles.arInstructionText}>
                            Point camera at flat surface
                        </Text>
                    </View>
                )}

                {/* Privacy Notice */}
                <View style={styles.privacyNotice}>
                    <Ionicons name="shield-checkmark" size={16} color="#10b981" />
                    <Text style={styles.privacyText}>
                        Your privacy is protected. No video is recorded.
                    </Text>
                </View>

                {/* Bottom Controls */}
                <View style={[styles.controls, { paddingBottom: insets.bottom + 20 }]}>
                    <TouchableOpacity 
                        style={styles.controlButton}
                        onPress={flipCamera}
                    >
                        <Ionicons name="camera-reverse" size={28} color="#fff" />
                        <Text style={styles.controlButtonText}>Flip</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.arButton, isARActive && styles.arButtonActive]}
                        onPress={toggleAR}
                    >
                        <Ionicons 
                            name={isARActive ? "cube" : "cube-outline"} 
                            size={32} 
                            color="#fff" 
                        />
                        <Text style={styles.arButtonText}>AR Mode</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.controlButton}
                        onPress={capturePhoto}
                    >
                        <Ionicons name="camera" size={28} color="#fff" />
                        <Text style={styles.controlButtonText}>Capture</Text>
                    </TouchableOpacity>
                </View>

                {/* Feature Notice */}
                <View style={styles.featureNotice}>
                    <Ionicons name="information-circle" size={20} color="#3b82f6" />
                    <Text style={styles.featureNoticeText}>
                        Full AR with 3D models coming soon!
                    </Text>
                </View>
            </Camera>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#fff',
        fontSize: 16,
    },
    noAccessContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        backgroundColor: '#1f2937',
    },
    noAccessText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: 16,
    },
    noAccessSubtext: {
        fontSize: 16,
        color: '#9ca3af',
        textAlign: 'center',
        marginTop: 8,
    },
    backButton: {
        backgroundColor: '#3b82f6',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        marginTop: 24,
    },
    backButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    camera: {
        flex: 1,
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    topButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    topCenter: {
        flex: 1,
        alignItems: 'center',
    },
    productNameText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    arBadge: {
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    arBadgeActive: {
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
    },
    arBadgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    arOverlay: {
        position: 'absolute',
        top: '40%',
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    arCrosshair: {
        width: 150,
        height: 150,
        justifyContent: 'center',
        alignItems: 'center',
    },
    crosshairLine: {
        position: 'absolute',
        width: 150,
        height: 2,
        backgroundColor: '#10b981',
    },
    crosshairLineVertical: {
        width: 2,
        height: 150,
    },
    arInstructionText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginTop: 20,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    privacyNotice: {
        position: 'absolute',
        top: '30%',
        left: 20,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 12,
        borderRadius: 8,
        gap: 8,
    },
    privacyText: {
        flex: 1,
        fontSize: 12,
        color: '#1f2937',
        fontWeight: '500',
    },
    controls: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        paddingTop: 20,
    },
    controlButton: {
        alignItems: 'center',
        gap: 4,
    },
    controlButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    arButton: {
        alignItems: 'center',
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 50,
        gap: 4,
    },
    arButtonActive: {
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
    },
    arButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    featureNotice: {
        position: 'absolute',
        bottom: 120,
        left: 20,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(59, 130, 246, 0.9)',
        padding: 12,
        borderRadius: 8,
        gap: 8,
    },
    featureNoticeText: {
        flex: 1,
        fontSize: 12,
        color: '#fff',
        fontWeight: '500',
    },
});
