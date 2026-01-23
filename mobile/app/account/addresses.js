import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, TextInput, Modal } from 'react-native';
import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import api from '../../lib/api';

export default function ManageAddresses() {
    const { isAuthenticated } = useAuthStore();
    const queryClient = useQueryClient();

    const [showAddressModal, setShowAddressModal] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        landmark: '',
        city: '',
        state: '',
        pincode: '',
        isDefault: false,
    });

    // Fetch addresses
    const { data: addressesData, isLoading } = useQuery({
        queryKey: ['addresses'],
        queryFn: async () => {
            const res = await api.get('/addresses');
            return res.data.data || [];
        },
        enabled: isAuthenticated,
    });

    const addresses = Array.isArray(addressesData) ? addressesData : [];

    // Create address mutation
    const createAddressMutation = useMutation({
        mutationFn: async (data) => {
            const res = await api.post('/addresses', data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['addresses']);
            Alert.alert('Success', 'Address added successfully!');
            setShowAddressModal(false);
            resetForm();
        },
        onError: (error) => {
            Alert.alert('Error', error.response?.data?.message || 'Failed to add address');
        },
    });

    // Update address mutation
    const updateAddressMutation = useMutation({
        mutationFn: async ({ id, data }) => {
            const res = await api.put(`/addresses/${id}`, data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['addresses']);
            Alert.alert('Success', 'Address updated successfully!');
            setShowAddressModal(false);
            setEditingAddress(null);
            resetForm();
        },
        onError: (error) => {
            Alert.alert('Error', error.response?.data?.message || 'Failed to update address');
        },
    });

    // Delete address mutation
    const deleteAddressMutation = useMutation({
        mutationFn: async (id) => {
            const res = await api.delete(`/addresses/${id}`);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['addresses']);
            Alert.alert('Success', 'Address deleted successfully!');
        },
        onError: (error) => {
            Alert.alert('Error', error.response?.data?.message || 'Failed to delete address');
        },
    });

    // Set default address mutation
    const setDefaultMutation = useMutation({
        mutationFn: async (id) => {
            const res = await api.put(`/addresses/${id}/default`);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['addresses']);
        },
        onError: (error) => {
            Alert.alert('Error', error.response?.data?.message || 'Failed to set default address');
        },
    });

    const resetForm = () => {
        setFormData({
            fullName: '',
            phone: '',
            addressLine1: '',
            addressLine2: '',
            landmark: '',
            city: '',
            state: '',
            pincode: '',
            isDefault: false,
        });
    };

    const handleAddNew = () => {
        resetForm();
        setEditingAddress(null);
        setShowAddressModal(true);
    };

    const handleEdit = (address) => {
        setFormData({
            fullName: address.fullName || '',
            phone: address.phone || '',
            addressLine1: address.addressLine1 || '',
            addressLine2: address.addressLine2 || '',
            landmark: address.landmark || '',
            city: address.city || '',
            state: address.state || '',
            pincode: address.pincode || '',
            isDefault: address.isDefault || false,
        });
        setEditingAddress(address);
        setShowAddressModal(true);
    };

    const handleDelete = (id) => {
        Alert.alert('Delete Address', 'Are you sure you want to delete this address?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: () => deleteAddressMutation.mutate(id),
            },
        ]);
    };

    const handleSetDefault = (id) => {
        setDefaultMutation.mutate(id);
    };

    const handleSaveAddress = () => {
        // Validation
        if (!formData.fullName.trim()) {
            Alert.alert('Error', 'Full name is required');
            return;
        }

        if (!formData.phone.trim()) {
            Alert.alert('Error', 'Phone number is required');
            return;
        }

        if (!/^\d{10}$/.test(formData.phone.trim())) {
            Alert.alert('Error', 'Please enter a valid 10-digit phone number');
            return;
        }

        if (!formData.addressLine1.trim()) {
            Alert.alert('Error', 'Address line 1 is required');
            return;
        }

        if (!formData.city.trim()) {
            Alert.alert('Error', 'City is required');
            return;
        }

        if (!formData.state.trim()) {
            Alert.alert('Error', 'State is required');
            return;
        }

        if (!formData.pincode.trim()) {
            Alert.alert('Error', 'Pincode is required');
            return;
        }

        if (!/^\d{6}$/.test(formData.pincode.trim())) {
            Alert.alert('Error', 'Please enter a valid 6-digit pincode');
            return;
        }

        if (editingAddress) {
            updateAddressMutation.mutate({
                id: editingAddress._id,
                data: formData,
            });
        } else {
            createAddressMutation.mutate(formData);
        }
    };

    if (!isAuthenticated) {
        return (
            <View style={styles.container}>
                <Stack.Screen
                    options={{
                        title: 'Manage Addresses',
                        headerShown: true,
                        headerStyle: { backgroundColor: '#f97316' },
                        headerTintColor: '#fff',
                    }}
                />
                <View style={styles.emptyState}>
                    <Ionicons name="location-outline" size={80} color="#d1d5db" />
                    <Text style={styles.emptyTitle}>Please Login</Text>
                    <Text style={styles.emptyText}>You need to login to manage addresses</Text>
                    <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/auth/login')}>
                        <Text style={styles.loginButtonText}>Login</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    if (isLoading) {
        return (
            <View style={styles.container}>
                <Stack.Screen
                    options={{
                        title: 'Manage Addresses',
                        headerShown: true,
                        headerStyle: { backgroundColor: '#f97316' },
                        headerTintColor: '#fff',
                    }}
                />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#f97316" />
                    <Text style={styles.loadingText}>Loading addresses...</Text>
                </View>
            </View>
        );
    }

    const isSaving =
        createAddressMutation.isPending ||
        updateAddressMutation.isPending ||
        deleteAddressMutation.isPending;

    return (
        <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
            <View style={styles.container}>
                <Stack.Screen
                    options={{
                        title: 'Manage Addresses',
                        headerShown: true,
                        headerStyle: { backgroundColor: '#f97316' },
                        headerTintColor: '#fff',
                    }}
                />

                <ScrollView style={styles.content}>
                    {addresses.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Ionicons name="location-outline" size={80} color="#d1d5db" />
                            <Text style={styles.emptyTitle}>No addresses yet</Text>
                            <Text style={styles.emptyText}>Add your first delivery address</Text>
                        </View>
                    ) : (
                        addresses.map((address) => (
                            <View key={address._id} style={styles.addressCard}>
                                {address.isDefault && (
                                    <View style={styles.defaultBadge}>
                                        <Text style={styles.defaultBadgeText}>DEFAULT</Text>
                                    </View>
                                )}
                                <Text style={styles.addressName}>{address.fullName}</Text>
                                <Text style={styles.addressText}>
                                    {address.addressLine1}
                                    {address.addressLine2 && `, ${address.addressLine2}`}
                                </Text>
                                {address.landmark && (
                                    <Text style={styles.addressText}>Landmark: {address.landmark}</Text>
                                )}
                                <Text style={styles.addressText}>
                                    {address.city}, {address.state} - {address.pincode}
                                </Text>
                                <Text style={styles.addressPhone}>Phone: {address.phone}</Text>

                                <View style={styles.addressActions}>
                                    {!address.isDefault && (
                                        <TouchableOpacity
                                            style={styles.actionButton}
                                            onPress={() => handleSetDefault(address._id)}
                                        >
                                            <Ionicons name="star-outline" size={18} color="#f97316" />
                                            <Text style={styles.actionButtonText}>Set Default</Text>
                                        </TouchableOpacity>
                                    )}
                                    <TouchableOpacity
                                        style={styles.actionButton}
                                        onPress={() => handleEdit(address)}
                                    >
                                        <Ionicons name="create-outline" size={18} color="#3b82f6" />
                                        <Text style={[styles.actionButtonText, { color: '#3b82f6' }]}>Edit</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.actionButton}
                                        onPress={() => handleDelete(address._id)}
                                    >
                                        <Ionicons name="trash-outline" size={18} color="#ef4444" />
                                        <Text style={[styles.actionButtonText, { color: '#ef4444' }]}>Delete</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    )}

                    <View style={{ height: 100 }} />
                </ScrollView>

                <TouchableOpacity style={styles.addButton} onPress={handleAddNew}>
                    <Ionicons name="add" size={24} color="#fff" />
                    <Text style={styles.addButtonText}>Add New Address</Text>
                </TouchableOpacity>

                {/* Address Form Modal */}
                <Modal visible={showAddressModal} animationType="slide" transparent={false}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {editingAddress ? 'Edit Address' : 'Add New Address'}
                            </Text>
                            <TouchableOpacity onPress={() => setShowAddressModal(false)}>
                                <Ionicons name="close" size={24} color="#1f2937" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalContent}>
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Full Name *</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formData.fullName}
                                    onChangeText={(text) => setFormData({ ...formData, fullName: text })}
                                    placeholder="Enter full name"
                                    autoCapitalize="words"
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Phone Number *</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formData.phone}
                                    onChangeText={(text) => setFormData({ ...formData, phone: text })}
                                    placeholder="Enter phone number"
                                    keyboardType="phone-pad"
                                    maxLength={10}
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Address Line 1 *</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formData.addressLine1}
                                    onChangeText={(text) => setFormData({ ...formData, addressLine1: text })}
                                    placeholder="House no., Building name"
                                    multiline
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Address Line 2</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formData.addressLine2}
                                    onChangeText={(text) => setFormData({ ...formData, addressLine2: text })}
                                    placeholder="Road name, Area, Colony"
                                    multiline
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Landmark</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formData.landmark}
                                    onChangeText={(text) => setFormData({ ...formData, landmark: text })}
                                    placeholder="E.g. near Apollo Hospital"
                                />
                            </View>

                            <View style={styles.formRow}>
                                <View style={styles.formGroupHalf}>
                                    <Text style={styles.label}>City *</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={formData.city}
                                        onChangeText={(text) => setFormData({ ...formData, city: text })}
                                        placeholder="City"
                                        autoCapitalize="words"
                                    />
                                </View>

                                <View style={styles.formGroupHalf}>
                                    <Text style={styles.label}>State *</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={formData.state}
                                        onChangeText={(text) => setFormData({ ...formData, state: text })}
                                        placeholder="State"
                                        autoCapitalize="words"
                                    />
                                </View>
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Pincode *</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formData.pincode}
                                    onChangeText={(text) => setFormData({ ...formData, pincode: text })}
                                    placeholder="6-digit pincode"
                                    keyboardType="number-pad"
                                    maxLength={6}
                                />
                            </View>

                            <TouchableOpacity
                                style={styles.defaultCheckbox}
                                onPress={() => setFormData({ ...formData, isDefault: !formData.isDefault })}
                            >
                                <Ionicons
                                    name={formData.isDefault ? 'checkbox' : 'square-outline'}
                                    size={24}
                                    color={formData.isDefault ? '#f97316' : '#d1d5db'}
                                />
                                <Text style={styles.checkboxLabel}>Set as default address</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                                onPress={handleSaveAddress}
                                disabled={isSaving}
                            >
                                {isSaving ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={styles.saveButtonText}>
                                        {editingAddress ? 'Update Address' : 'Save Address'}
                                    </Text>
                                )}
                            </TouchableOpacity>

                            <View style={{ height: 40 }} />
                        </ScrollView>
                    </View>
                </Modal>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#6b7280',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        marginTop: 100,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
        marginTop: 16,
    },
    emptyText: {
        fontSize: 14,
        color: '#6b7280',
        marginTop: 8,
    },
    loginButton: {
        backgroundColor: '#f97316',
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 8,
        marginTop: 24,
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    content: {
        flex: 1,
    },
    addressCard: {
        backgroundColor: '#fff',
        padding: 16,
        marginHorizontal: 16,
        marginTop: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    defaultBadge: {
        backgroundColor: '#f97316',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        alignSelf: 'flex-start',
        marginBottom: 8,
    },
    defaultBadgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    addressName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 4,
    },
    addressText: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 2,
    },
    addressPhone: {
        fontSize: 14,
        color: '#6b7280',
        marginTop: 4,
        marginBottom: 12,
    },
    addressActions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    actionButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#f97316',
    },
    addButton: {
        position: 'absolute',
        bottom: 20,
        left: 16,
        right: 16,
        backgroundColor: '#f97316',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 8,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    modalHeader: {
        backgroundColor: '#fff',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    modalContent: {
        flex: 1,
        padding: 16,
    },
    formGroup: {
        marginBottom: 16,
    },
    formRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    formGroupHalf: {
        flex: 1,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 6,
    },
    input: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        backgroundColor: '#fff',
    },
    defaultCheckbox: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
        gap: 8,
    },
    checkboxLabel: {
        fontSize: 14,
        color: '#1f2937',
    },
    saveButton: {
        backgroundColor: '#f97316',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    saveButtonDisabled: {
        opacity: 0.6,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
