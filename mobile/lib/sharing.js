import * as Sharing from 'expo-sharing';
import { Platform, Alert } from 'react-native';

export async function shareProduct(product) {
    try {
        const message = `Check out ${product.name} on Damini Mart!\n\nPrice: ₹${product.price}\n\nDownload the app to order now!`;

        if (Platform.OS === 'web') {
            if (navigator.share) {
                await navigator.share({
                    title: product.name,
                    text: message,
                    url: window.location.href,
                });
            } else {
                // Fallback for web
                await navigator.clipboard.writeText(message);
                Alert.alert('Copied', 'Product details copied to clipboard!');
            }
        } else {
            const isAvailable = await Sharing.isAvailableAsync();
            if (isAvailable) {
                await Sharing.shareAsync('data:text/plain;base64,' + btoa(message), {
                    dialogTitle: `Share ${product.name}`,
                });
            } else {
                Alert.alert('Error', 'Sharing is not available on this device');
            }
        }
    } catch (error) {
        console.error('Error sharing:', error);
        if (error.message !== 'Share canceled') {
            Alert.alert('Error', 'Failed to share product');
        }
    }
}

export async function shareOrder(order) {
    try {
        const message = `My Order #${order.orderNumber} from Damini Mart\n\nTotal: ₹${order.pricing?.total || 0}\nStatus: ${order.status}\n\nDownload Damini Mart app to place your order!`;

        if (Platform.OS === 'web') {
            if (navigator.share) {
                await navigator.share({
                    title: `Order #${order.orderNumber}`,
                    text: message,
                });
            }
        } else {
            const isAvailable = await Sharing.isAvailableAsync();
            if (isAvailable) {
                await Sharing.shareAsync('data:text/plain;base64,' + btoa(message), {
                    dialogTitle: `Share Order #${order.orderNumber}`,
                });
            }
        }
    } catch (error) {
        if (error.message !== 'Share canceled') {
            Alert.alert('Error', 'Failed to share order');
        }
    }
}
