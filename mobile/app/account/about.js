import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, Linking } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function AboutUs() {
    const handleWebsite = () => {
        Linking.openURL('https://akmultivision.com');
    };

    const handleEmail = () => {
        Linking.openURL('mailto:info@daminimart.com');
    };

    const handlePhone = () => {
        Linking.openURL('tel:+911234567890');
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
            <View style={styles.container}>
                <Stack.Screen
                    options={{
                        title: 'About Us',
                        headerShown: true,
                        headerStyle: { backgroundColor: '#f97316' },
                        headerTintColor: '#fff',
                    }}
                />

                <ScrollView style={styles.content}>
                    {/* App Logo/Brand */}
                    <View style={styles.brandSection}>
                        <View style={styles.logoContainer}>
                            <Ionicons name="storefront" size={64} color="#f97316" />
                        </View>
                        <Text style={styles.appName}>Damini Mart</Text>
                        <Text style={styles.appTagline}>Fresh Groceries Delivered to Your Door</Text>
                        <Text style={styles.appVersion}>Version 1.0.0</Text>
                    </View>

                    {/* About Damini Mart */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>About Damini Mart</Text>
                        <Text style={styles.paragraph}>
                            Damini Mart is your trusted neighborhood grocery store, now available at your fingertips. We bring you fresh fruits, vegetables, groceries, and daily essentials with the convenience of home delivery.
                        </Text>
                        <Text style={styles.paragraph}>
                            Our mission is to provide quality products at affordable prices while ensuring a seamless shopping experience for our customers.
                        </Text>
                    </View>

                    {/* Our Values */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Our Values</Text>

                        <View style={styles.valueCard}>
                            <View style={styles.valueIcon}>
                                <Ionicons name="leaf" size={32} color="#10b981" />
                            </View>
                            <View style={styles.valueContent}>
                                <Text style={styles.valueTitle}>Fresh & Quality</Text>
                                <Text style={styles.valueText}>We ensure all products are fresh and of the highest quality</Text>
                            </View>
                        </View>

                        <View style={styles.valueCard}>
                            <View style={styles.valueIcon}>
                                <Ionicons name="flash" size={32} color="#f59e0b" />
                            </View>
                            <View style={styles.valueContent}>
                                <Text style={styles.valueTitle}>Fast Delivery</Text>
                                <Text style={styles.valueText}>Quick delivery within 24-48 hours to your doorstep</Text>
                            </View>
                        </View>

                        <View style={styles.valueCard}>
                            <View style={styles.valueIcon}>
                                <Ionicons name="shield-checkmark" size={32} color="#3b82f6" />
                            </View>
                            <View style={styles.valueContent}>
                                <Text style={styles.valueTitle}>Trusted Service</Text>
                                <Text style={styles.valueText}>Reliable service with thousands of satisfied customers</Text>
                            </View>
                        </View>

                        <View style={styles.valueCard}>
                            <View style={styles.valueIcon}>
                                <Ionicons name="pricetag" size={32} color="#ef4444" />
                            </View>
                            <View style={styles.valueContent}>
                                <Text style={styles.valueTitle}>Best Prices</Text>
                                <Text style={styles.valueText}>Competitive pricing with regular offers and discounts</Text>
                            </View>
                        </View>
                    </View>

                    {/* Contact Information */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Contact Information</Text>

                        <TouchableOpacity style={styles.contactItem} onPress={handlePhone}>
                            <Ionicons name="call" size={24} color="#f97316" />
                            <Text style={styles.contactText}>+91 123 456 7890</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.contactItem} onPress={handleEmail}>
                            <Ionicons name="mail" size={24} color="#f97316" />
                            <Text style={styles.contactText}>info@daminimart.com</Text>
                        </TouchableOpacity>

                        <View style={styles.contactItem}>
                            <Ionicons name="location" size={24} color="#f97316" />
                            <Text style={styles.contactText}>123 Market Street, City, State - 123456</Text>
                        </View>
                    </View>

                    {/* Built By Section */}
                    <View style={styles.developerSection}>
                        <Text style={styles.developerTitle}>Built By</Text>
                        <View style={styles.developerCard}>
                            <View style={styles.developerIcon}>
                                <Ionicons name="code-slash" size={32} color="#f97316" />
                            </View>
                            <View style={styles.developerInfo}>
                                <Text style={styles.developerName}>AKMultivision Multimedia Services</Text>
                                <Text style={styles.developerTagline}>Your Digital Solutions Partner</Text>
                                <TouchableOpacity onPress={handleWebsite} style={styles.websiteButton}>
                                    <Ionicons name="globe-outline" size={16} color="#f97316" />
                                    <Text style={styles.websiteText}>Visit Website</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <Text style={styles.developerDescription}>
                            AKMultivision specializes in creating innovative digital solutions including mobile apps, websites, and multimedia services for businesses of all sizes.
                        </Text>
                    </View>

                    {/* Social Media */}
                    <View style={styles.socialSection}>
                        <Text style={styles.sectionTitle}>Follow Us</Text>
                        <View style={styles.socialIcons}>
                            <TouchableOpacity style={styles.socialIcon}>
                                <Ionicons name="logo-facebook" size={32} color="#1877f2" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.socialIcon}>
                                <Ionicons name="logo-instagram" size={32} color="#e4405f" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.socialIcon}>
                                <Ionicons name="logo-twitter" size={32} color="#1da1f2" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.socialIcon}>
                                <Ionicons name="logo-whatsapp" size={32} color="#25d366" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Copyright */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>© 2026 Damini Mart. All rights reserved.</Text>
                        <Text style={styles.footerText}>Developed by AKMultivision Multimedia Services</Text>
                    </View>
                </ScrollView>
            </View>
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
    },
    brandSection: {
        backgroundColor: '#fff',
        alignItems: 'center',
        padding: 32,
        marginBottom: 8,
    },
    logoContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#fff7ed',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    appName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 8,
    },
    appTagline: {
        fontSize: 16,
        color: '#6b7280',
        textAlign: 'center',
        marginBottom: 8,
    },
    appVersion: {
        fontSize: 14,
        color: '#9ca3af',
    },
    section: {
        backgroundColor: '#fff',
        padding: 16,
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 16,
    },
    paragraph: {
        fontSize: 15,
        color: '#4b5563',
        lineHeight: 24,
        marginBottom: 12,
        textAlign: 'justify',
    },
    valueCard: {
        flexDirection: 'row',
        backgroundColor: '#f9fafb',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    valueIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    valueContent: {
        flex: 1,
    },
    valueTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 4,
    },
    valueText: {
        fontSize: 14,
        color: '#6b7280',
        lineHeight: 20,
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    contactText: {
        fontSize: 16,
        color: '#1f2937',
        marginLeft: 12,
        flex: 1,
    },
    developerSection: {
        backgroundColor: '#fff',
        padding: 16,
        marginBottom: 8,
    },
    developerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 16,
        textAlign: 'center',
    },
    developerCard: {
        backgroundColor: '#fff7ed',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 2,
        borderColor: '#fed7aa',
    },
    developerIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    developerInfo: {
        flex: 1,
    },
    developerName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 4,
    },
    developerTagline: {
        fontSize: 13,
        color: '#6b7280',
        marginBottom: 8,
    },
    websiteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    websiteText: {
        fontSize: 14,
        color: '#f97316',
        fontWeight: '600',
        marginLeft: 6,
    },
    developerDescription: {
        fontSize: 14,
        color: '#6b7280',
        lineHeight: 20,
        textAlign: 'center',
    },
    socialSection: {
        backgroundColor: '#fff',
        padding: 16,
        marginBottom: 8,
        alignItems: 'center',
    },
    socialIcons: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
    },
    socialIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#f9fafb',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footer: {
        padding: 32,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        color: '#9ca3af',
        marginBottom: 4,
        textAlign: 'center',
    },
});
