import * as Location from 'expo-location';
import { Alert } from 'react-native';

class LocationService {
    async requestPermissions() {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(
                    'Permission Denied',
                    'Location permission is required to provide accurate delivery addresses.'
                );
                return false;
            }
            return true;
        } catch (error) {
            console.error('Error requesting location permission:', error);
            return false;
        }
    }

    async getCurrentLocation() {
        const hasPermission = await this.requestPermissions();
        if (!hasPermission) return null;

        try {
            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });
            return location;
        } catch (error) {
            console.error('Error getting current location:', error);
            Alert.alert('Error', 'Failed to get your current location');
            return null;
        }
    }

    async getAddressFromCoordinates(latitude, longitude) {
        try {
            const addresses = await Location.reverseGeocodeAsync({
                latitude,
                longitude,
            });

            if (addresses && addresses.length > 0) {
                const address = addresses[0];
                return {
                    street: address.street || '',
                    city: address.city || '',
                    region: address.region || '',
                    postalCode: address.postalCode || '',
                    country: address.country || '',
                    formattedAddress: `${address.street || ''}, ${address.city || ''}, ${address.region || ''} ${address.postalCode || ''}`.trim(),
                };
            }
            return null;
        } catch (error) {
            console.error('Error reverse geocoding:', error);
            return null;
        }
    }

    async getCurrentAddress() {
        const location = await this.getCurrentLocation();
        if (!location) return null;

        const { latitude, longitude } = location.coords;
        return await this.getAddressFromCoordinates(latitude, longitude);
    }

    async searchAddress(query) {
        try {
            const results = await Location.geocodeAsync(query);
            if (results && results.length > 0) {
                return results.map(result => ({
                    latitude: result.latitude,
                    longitude: result.longitude,
                }));
            }
            return [];
        } catch (error) {
            console.error('Error geocoding address:', error);
            return [];
        }
    }

    calculateDistance(lat1, lon1, lat2, lon2) {
        // Haversine formula to calculate distance in kilometers
        const R = 6371; // Radius of Earth in km
        const dLat = this.toRad(lat2 - lat1);
        const dLon = this.toRad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRad(lat1)) *
            Math.cos(this.toRad(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        return distance;
    }

    toRad(value) {
        return (value * Math.PI) / 180;
    }

    // Check if delivery is available within range (e.g., 50km)
    isDeliveryAvailable(userLat, userLon, storeLat, storeLon, maxDistance = 50) {
        const distance = this.calculateDistance(userLat, userLon, storeLat, storeLon);
        return {
            available: distance <= maxDistance,
            distance: distance.toFixed(2),
        };
    }
}

export default new LocationService();
