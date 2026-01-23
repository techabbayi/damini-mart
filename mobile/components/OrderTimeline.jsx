import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ORDER_STATUSES = [
    { key: 'placed', label: 'Order Placed', icon: 'checkmark-circle' },
    { key: 'confirmed', label: 'Confirmed', icon: 'thumbs-up' },
    { key: 'processing', label: 'Processing', icon: 'cube' },
    { key: 'out_for_delivery', label: 'Out for Delivery', icon: 'bicycle' },
    { key: 'delivered', label: 'Delivered', icon: 'checkmark-done-circle' },
];

export default function OrderTimeline({ currentStatus, statusHistory = [] }) {
    const currentIndex = ORDER_STATUSES.findIndex(s => s.key === currentStatus);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Order Progress</Text>
            {ORDER_STATUSES.map((status, index) => {
                const isCompleted = index <= currentIndex;
                const isCurrent = index === currentIndex;
                const statusData = statusHistory.find(h => h.status === status.key);

                return (
                    <View key={status.key} style={styles.stepContainer}>
                        {index > 0 && (
                            <View
                                style={[
                                    styles.line,
                                    isCompleted ? styles.lineCompleted : styles.linePending
                                ]}
                            />
                        )}
                        <View style={styles.step}>
                            <View
                                style={[
                                    styles.iconContainer,
                                    isCompleted ? styles.iconCompleted : styles.iconPending,
                                    isCurrent && styles.iconCurrent,
                                ]}
                            >
                                <Ionicons
                                    name={status.icon}
                                    size={20}
                                    color={isCompleted ? '#fff' : '#9ca3af'}
                                />
                            </View>
                            <View style={styles.stepInfo}>
                                <Text
                                    style={[
                                        styles.stepLabel,
                                        isCompleted && styles.stepLabelCompleted,
                                        isCurrent && styles.stepLabelCurrent,
                                    ]}
                                >
                                    {status.label}
                                </Text>
                                {statusData && (
                                    <Text style={styles.stepTime}>
                                        {new Date(statusData.timestamp).toLocaleString('en-IN', {
                                            day: 'numeric',
                                            month: 'short',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </Text>
                                )}
                                {isCurrent && !statusData && (
                                    <Text style={styles.stepCurrent}>Current Status</Text>
                                )}
                            </View>
                        </View>
                    </View>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 20,
    },
    stepContainer: {
        position: 'relative',
        marginBottom: 24,
    },
    line: {
        position: 'absolute',
        left: 19,
        top: -24,
        width: 2,
        height: 24,
    },
    lineCompleted: {
        backgroundColor: '#10b981',
    },
    linePending: {
        backgroundColor: '#e5e7eb',
    },
    step: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    iconCompleted: {
        backgroundColor: '#10b981',
    },
    iconPending: {
        backgroundColor: '#f3f4f6',
        borderWidth: 2,
        borderColor: '#e5e7eb',
    },
    iconCurrent: {
        backgroundColor: '#f97316',
        shadowColor: '#f97316',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    stepInfo: {
        flex: 1,
        paddingTop: 8,
    },
    stepLabel: {
        fontSize: 16,
        color: '#6b7280',
        fontWeight: '500',
    },
    stepLabelCompleted: {
        color: '#1f2937',
        fontWeight: '600',
    },
    stepLabelCurrent: {
        color: '#f97316',
        fontWeight: 'bold',
    },
    stepTime: {
        fontSize: 12,
        color: '#9ca3af',
        marginTop: 2,
    },
    stepCurrent: {
        fontSize: 12,
        color: '#f97316',
        fontWeight: '600',
        marginTop: 2,
    },
});
