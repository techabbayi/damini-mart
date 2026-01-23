import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
        this.setState({
            error,
            errorInfo,
        });
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <View style={styles.container}>
                    <Ionicons name="warning-outline" size={80} color="#ef4444" />
                    <Text style={styles.title}>Oops! Something went wrong</Text>
                    <Text style={styles.subtitle}>
                        The app encountered an unexpected error
                    </Text>

                    {__DEV__ && this.state.error && (
                        <ScrollView style={styles.errorDetails}>
                            <Text style={styles.errorText}>
                                {this.state.error.toString()}
                            </Text>
                            <Text style={styles.errorStack}>
                                {this.state.errorInfo?.componentStack}
                            </Text>
                        </ScrollView>
                    )}

                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={this.handleRetry}
                    >
                        <Ionicons name="refresh" size={20} color="#fff" />
                        <Text style={styles.retryButtonText}>Try Again</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f9fafb',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
        marginTop: 16,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#6b7280',
        marginTop: 8,
        textAlign: 'center',
    },
    errorDetails: {
        marginTop: 20,
        maxHeight: 200,
        backgroundColor: '#fee2e2',
        borderRadius: 8,
        padding: 12,
        width: '100%',
    },
    errorText: {
        color: '#dc2626',
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    errorStack: {
        color: '#991b1b',
        fontSize: 12,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    retryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f97316',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        marginTop: 24,
        gap: 8,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default ErrorBoundary;
