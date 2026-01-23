import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function HelpSupport() {
    const handleEmail = () => {
        Linking.openURL('mailto:support@daminimart.com');
    };

    const handlePhone = () => {
        Linking.openURL('tel:+911234567890');
    };

    const handleWhatsApp = () => {
        Linking.openURL('https://wa.me/911234567890');
    };

    const faqs = [
        {
            question: 'How do I place an order?',
            answer: 'Browse products, add them to cart, proceed to checkout, and complete payment. Your order will be confirmed immediately.',
        },
        {
            question: 'What are the delivery charges?',
            answer: 'Delivery is free for orders above ₹500. For orders below ₹500, a delivery charge of ₹40 applies.',
        },
        {
            question: 'How long does delivery take?',
            answer: 'We deliver within 24-48 hours in most areas. You can track your order status in the Orders section.',
        },
        {
            question: 'What is your return policy?',
            answer: 'We accept returns within 7 days of delivery for damaged or incorrect items. Contact support for assistance.',
        },
        {
            question: 'How can I track my order?',
            answer: 'Go to Orders tab and click on any order to see detailed tracking information and status updates.',
        },
        {
            question: 'What payment methods do you accept?',
            answer: 'We accept UPI, Credit/Debit Cards, Net Banking, and Cash on Delivery for eligible orders.',
        },
    ];

    return (
        <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
            <View style={styles.container}>
                <Stack.Screen
                    options={{
                        title: 'Help & Support',
                        headerShown: true,
                        headerStyle: { backgroundColor: '#f97316' },
                        headerTintColor: '#fff',
                    }}
                />

                <ScrollView style={styles.content}>
                    {/* Contact Options */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Contact Us</Text>

                        <TouchableOpacity style={styles.contactCard} onPress={handlePhone}>
                            <View style={styles.contactIcon}>
                                <Ionicons name="call" size={24} color="#f97316" />
                            </View>
                            <View style={styles.contactInfo}>
                                <Text style={styles.contactTitle}>Phone Support</Text>
                                <Text style={styles.contactSubtitle}>+91 123 456 7890</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.contactCard} onPress={handleEmail}>
                            <View style={styles.contactIcon}>
                                <Ionicons name="mail" size={24} color="#f97316" />
                            </View>
                            <View style={styles.contactInfo}>
                                <Text style={styles.contactTitle}>Email Support</Text>
                                <Text style={styles.contactSubtitle}>support@daminimart.com</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.contactCard} onPress={handleWhatsApp}>
                            <View style={styles.contactIcon}>
                                <Ionicons name="logo-whatsapp" size={24} color="#10b981" />
                            </View>
                            <View style={styles.contactInfo}>
                                <Text style={styles.contactTitle}>WhatsApp</Text>
                                <Text style={styles.contactSubtitle}>Chat with us on WhatsApp</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                        </TouchableOpacity>
                    </View>

                    {/* FAQs */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>

                        {faqs.map((faq, index) => (
                            <View key={index} style={styles.faqCard}>
                                <View style={styles.faqQuestion}>
                                    <Ionicons name="help-circle" size={20} color="#f97316" />
                                    <Text style={styles.faqQuestionText}>{faq.question}</Text>
                                </View>
                                <Text style={styles.faqAnswer}>{faq.answer}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Quick Links */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Quick Links</Text>

                        <TouchableOpacity style={styles.linkCard}>
                            <Ionicons name="document-text-outline" size={24} color="#f97316" />
                            <Text style={styles.linkText}>Terms & Conditions</Text>
                            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.linkCard}>
                            <Ionicons name="shield-checkmark-outline" size={24} color="#f97316" />
                            <Text style={styles.linkText}>Privacy Policy</Text>
                            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.linkCard}>
                            <Ionicons name="refresh-outline" size={24} color="#f97316" />
                            <Text style={styles.linkText}>Return & Refund Policy</Text>
                            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                        </TouchableOpacity>
                    </View>

                    {/* Business Hours */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Business Hours</Text>
                        <View style={styles.hoursCard}>
                            <View style={styles.hoursRow}>
                                <Text style={styles.hoursDay}>Monday - Saturday</Text>
                                <Text style={styles.hoursTime}>9:00 AM - 9:00 PM</Text>
                            </View>
                            <View style={styles.hoursRow}>
                                <Text style={styles.hoursDay}>Sunday</Text>
                                <Text style={styles.hoursTime}>10:00 AM - 6:00 PM</Text>
                            </View>
                        </View>
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
    section: {
        padding: 16,
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 16,
    },
    contactCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    contactIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#fff7ed',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    contactInfo: {
        flex: 1,
    },
    contactTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
    },
    contactSubtitle: {
        fontSize: 14,
        color: '#6b7280',
        marginTop: 2,
    },
    faqCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    faqQuestion: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    faqQuestionText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
        marginLeft: 8,
        flex: 1,
    },
    faqAnswer: {
        fontSize: 14,
        color: '#6b7280',
        lineHeight: 20,
        paddingLeft: 28,
    },
    linkCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    linkText: {
        flex: 1,
        fontSize: 16,
        color: '#1f2937',
        marginLeft: 12,
        fontWeight: '500',
    },
    hoursCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    hoursRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    hoursDay: {
        fontSize: 16,
        color: '#1f2937',
        fontWeight: '500',
    },
    hoursTime: {
        fontSize: 16,
        color: '#6b7280',
    },
});
