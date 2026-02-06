import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Share, Alert } from 'react-native';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation } from '@tanstack/react-query';
import * as Clipboard from 'expo-clipboard';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';

export default function ReferralScreen() {
    const insets = useSafeAreaInsets();
    const { isAuthenticated } = useAuthStore();
    const [referralCodeInput, setReferralCodeInput] = useState('');

    // Fetch referral data
    const { data: referralData, isLoading, refetch } = useQuery({
        queryKey: ['my-referral'],
        queryFn: async () => {
            const res = await api.get('/referrals/my-code');
            return res.data.data;
        },
        enabled: isAuthenticated,
    });

    // Fetch stats
    const { data: stats } = useQuery({
        queryKey: ['referral-stats'],
        queryFn: async () => {
            const res = await api.get('/referrals/stats');
            return res.data.data;
        },
        enabled: isAuthenticated,
    });

    // Apply referral code mutation
    const applyMutation = useMutation({
        mutationFn: async (code) => {
            const res = await api.post('/referrals/apply', { referralCode: code });
            return res.data;
        },
        onSuccess: (data) => {
            Alert.alert('Success!', data.message);
            setReferralCodeInput('');
            refetch();
        },
        onError: (error) => {
            Alert.alert('Error', error.response?.data?.message || 'Failed to apply referral code');
        },
    });

    const handleCopyCode = async () => {
        if (referralData?.referralCode) {
            await Clipboard.setStringAsync(referralData.referralCode);
            Alert.alert('Copied!', 'Referral code copied to clipboard');
        }
    };

    const handleShare = async () => {
        try {
            const message = `Join LocalBazar using my referral code: ${referralData?.referralCode}\n\nWe both get ₹50 rewards! 🎉\n\nDownload the app now!`;
            await Share.share({ message });
        } catch (error) {
            console.error('Share error:', error);
        }
    };

    const handleApplyCode = () => {
        if (!referralCodeInput.trim()) {
            Alert.alert('Error', 'Please enter a referral code');
            return;
        }
        applyMutation.mutate(referralCodeInput.trim());
    };

    if (!isAuthenticated) {
        return (
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <Stack.Screen options={{ headerShown: false }} />
                <View style={styles.notLoggedIn}>
                    <Ionicons name="gift-outline" size={80} color="#d1d5db" />
                    <Text style={styles.notLoggedInText}>Please login to access referrals</Text>
                    <TouchableOpacity 
                        style={styles.loginButton}
                        onPress={() => router.push('/auth/login')}
                    >
                        <Text style={styles.loginButtonText}>Login</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <Stack.Screen 
                options={{
                    headerShown: true,
                    title: 'Refer & Earn',
                    headerStyle: { backgroundColor: '#10b981' },
                    headerTintColor: '#fff',
                    headerTitleStyle: { fontWeight: 'bold' },
                }}
            />

            <ScrollView style={styles.content}>
                {/* Earnings Card */}
                <View style={styles.earningsCard}>
                    <View style={styles.earningsHeader}>
                        <Ionicons name="cash" size={32} color="#10b981" />
                        <Text style={styles.earningsTitle}>Total Earnings</Text>
                    </View>
                    <Text style={styles.earningsAmount}>₹{stats?.totalEarnings || 0}</Text>
                    <Text style={styles.earningsSubtext}>
                        From {stats?.totalReferrals || 0} successful referrals
                    </Text>
                </View>

                {/* Your Referral Code */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Your Referral Code</Text>
                    <View style={styles.codeCard}>
                        <View style={styles.codeBox}>
                            <Text style={styles.codeText}>
                                {referralData?.referralCode || 'Loading...'}
                            </Text>
                        </View>
                        <View style={styles.codeActions}>
                            <TouchableOpacity 
                                style={styles.copyButton}
                                onPress={handleCopyCode}
                            >
                                <Ionicons name="copy-outline" size={20} color="#fff" />
                                <Text style={styles.copyButtonText}>Copy</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={styles.shareButton}
                                onPress={handleShare}
                            >
                                <Ionicons name="share-social-outline" size={20} color="#fff" />
                                <Text style={styles.shareButtonText}>Share</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* How it Works */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>How it Works</Text>
                    <View style={styles.stepsCard}>
                        <View style={styles.step}>
                            <View style={styles.stepNumber}>
                                <Text style={styles.stepNumberText}>1</Text>
                            </View>
                            <View style={styles.stepContent}>
                                <Text style={styles.stepTitle}>Share your code</Text>
                                <Text style={styles.stepText}>
                                    Share your unique referral code with friends
                                </Text>
                            </View>
                        </View>

                        <View style={styles.step}>
                            <View style={styles.stepNumber}>
                                <Text style={styles.stepNumberText}>2</Text>
                            </View>
                            <View style={styles.stepContent}>
                                <Text style={styles.stepTitle}>Friend signs up</Text>
                                <Text style={styles.stepText}>
                                    They register using your referral code
                                </Text>
                            </View>
                        </View>

                        <View style={styles.step}>
                            <View style={styles.stepNumber}>
                                <Text style={styles.stepNumberText}>3</Text>
                            </View>
                            <View style={styles.stepContent}>
                                <Text style={styles.stepTitle}>Both get rewards!</Text>
                                <Text style={styles.stepText}>
                                    You both receive ₹50 in your wallet
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Apply Referral Code */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Have a Referral Code?</Text>
                    <View style={styles.applyCard}>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter referral code"
                            value={referralCodeInput}
                            onChangeText={setReferralCodeInput}
                            autoCapitalize="characters"
                            maxLength={10}
                        />
                        <TouchableOpacity 
                            style={styles.applyButton}
                            onPress={handleApplyCode}
                            disabled={applyMutation.isPending}
                        >
                            <Text style={styles.applyButtonText}>
                                {applyMutation.isPending ? 'Applying...' : 'Apply'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Recent Referrals */}
                {stats?.recentReferrals && stats.recentReferrals.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Recent Referrals</Text>
                        {stats.recentReferrals.map((referral, index) => (
                            <View key={index} style={styles.referralItem}>
                                <View style={styles.referralAvatar}>
                                    <Text style={styles.referralAvatarText}>
                                        {referral.user?.name?.charAt(0).toUpperCase()}
                                    </Text>
                                </View>
                                <View style={styles.referralInfo}>
                                    <Text style={styles.referralName}>{referral.user?.name}</Text>
                                    <Text style={styles.referralDate}>
                                        {new Date(referral.joinedAt).toLocaleDateString()}
                                    </Text>
                                </View>
                                <Text style={styles.referralReward}>+₹{referral.reward}</Text>
                            </View>
                        ))}
                    </View>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    notLoggedIn: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    notLoggedInText: {
        fontSize: 18,
        color: '#6b7280',
        marginTop: 16,
        marginBottom: 24,
    },
    loginButton: {
        backgroundColor: '#10b981',
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 8,
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    earningsCard: {
        backgroundColor: '#fff',
        padding: 24,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    earningsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    earningsTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1f2937',
    },
    earningsAmount: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#10b981',
    },
    earningsSubtext: {
        fontSize: 14,
        color: '#6b7280',
        marginTop: 4,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 12,
    },
    codeCard: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    codeBox: {
        backgroundColor: '#f3f4f6',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 16,
    },
    codeText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#10b981',
        letterSpacing: 2,
    },
    codeActions: {
        flexDirection: 'row',
        gap: 12,
    },
    copyButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#10b981',
        padding: 12,
        borderRadius: 8,
        gap: 8,
    },
    copyButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    shareButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#3b82f6',
        padding: 12,
        borderRadius: 8,
        gap: 8,
    },
    shareButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    stepsCard: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    step: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    stepNumber: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#10b981',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    stepNumberText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    stepContent: {
        flex: 1,
    },
    stepTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 4,
    },
    stepText: {
        fontSize: 14,
        color: '#6b7280',
    },
    applyCard: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        flexDirection: 'row',
        gap: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 16,
    },
    applyButton: {
        backgroundColor: '#10b981',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
        justifyContent: 'center',
    },
    applyButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    referralItem: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    referralAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#10b981',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    referralAvatarText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    referralInfo: {
        flex: 1,
    },
    referralName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
    },
    referralDate: {
        fontSize: 14,
        color: '#6b7280',
    },
    referralReward: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#10b981',
    },
});
