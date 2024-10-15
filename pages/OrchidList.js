import { get, ref } from 'firebase/database';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { database } from '../firebaseConfig';

const OrchidList = ({ navigation }) => {
    const [categories, setCategories] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const categoriesRef = ref(database, 'Categories');
            const snapshot = await get(categoriesRef);
            if (snapshot.exists()) {
                const data = snapshot.val();
                const categoriesList = Object.keys(data)
                    .filter(key => data[key].items && Object.keys(data[key].items)) // Lọc các categories có items
                    .map(key => ({
                        name: data[key].name,
                        items: Object.values(data[key].items || {}).map(item => ({ ...item, category: data[key].name }))
                    }));
                setCategories(categoriesList);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchCategories();
        setRefreshing(false);
    };

    const renderOrchidItem = ({ item, categoryName }) => (
        <TouchableOpacity onPress={() => navigation.navigate('OrchidDetail', { orchid: item, categoryName: categoryName })}>
            <View style={styles.orchidItem}>
                <Image source={{ uri: item.image }} style={styles.orchidImage} />
                <View style={styles.orchidDetails}>
                    <Text style={styles.orchidName}>{item.name}</Text>
                    <Text>Price: ${item.price}</Text>
                    <Text>Rating: {item.rating}</Text>
                    <Text>Color: {item.color}</Text>
                    <Text>Origin: {item.origin}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderCategory = ({ item }) => (
        <View style={styles.categoryContainer}>
            <Text style={styles.categoryTitle}>{item.name}</Text>
            {item.items && item.items.length > 0 && (
                <FlatList
                    data={Object.values(item.items)}
                    renderItem={({ item }) => renderOrchidItem({ item, categoryName: item.category })}
                    keyExtractor={(item) => item.name}
                    horizontal={true}
                />
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={categories}
                renderItem={renderCategory}
                keyExtractor={(item) => item.name}
                refreshing={refreshing}
                onRefresh={onRefresh}
            />
            <TouchableOpacity
                style={styles.favoritesButton}
                onPress={() => navigation.navigate('Favorites')}
            >
                <Text style={styles.favoritesButtonText}>Danh sách yêu thích</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.addButton}
                onPress={() => navigation.navigate('AddOrchid', { categories: categories.map(cat => cat.name) })}
            >
                <Text style={styles.addButtonText}>Thêm</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.refreshButton}
                onPress={onRefresh}
            >
                <Text style={styles.refreshButtonText}>Làm Mới</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#f0f8f5',
    },
    categoryContainer: {
        marginBottom: 20,
        backgroundColor: '#ffffff',
        borderRadius: 10,
        padding: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    categoryTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#2e7d32',
        marginBottom: 10,
    },
    orchidItem: {
        flexDirection: 'row',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        width: 300,
        marginRight: 10,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
    },
    orchidImage: {
        width: 100,
        height: 100,
        marginRight: 10,
        borderRadius: 8,
    },
    orchidDetails: {
        flex: 1,
    },
    orchidName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#388e3c',
    },
    favoritesButton: {
        position: 'absolute',
        right: 20,
        bottom: 80,
        backgroundColor: '#81c784',
        borderRadius: 50,
        paddingVertical: 10,
        paddingHorizontal: 20,
        elevation: 5,
    },
    favoritesButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    addButton: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        backgroundColor: '#66bb6a',
        borderRadius: 50,
        paddingVertical: 10,
        paddingHorizontal: 20,
        elevation: 5,
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    refreshButton: {
        position: 'absolute',
        right: 20,
        bottom: 140,
        backgroundColor: '#4caf50',
        borderRadius: 50,
        paddingVertical: 10,
        paddingHorizontal: 20,
        elevation: 5,
    },
    refreshButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default OrchidList;
