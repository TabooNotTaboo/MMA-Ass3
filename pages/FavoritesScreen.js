import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const FavoritesScreen = ({ navigation }) => {
    const [favorites, setFavorites] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            loadFavorites();
        });

        return unsubscribe;
    }, [navigation]);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadFavorites();
        setRefreshing(false);
    };

    const loadFavorites = async () => {
        try {
            const storedFavorites = await AsyncStorage.getItem('favorites');
            if (storedFavorites !== null) {
                setFavorites(JSON.parse(storedFavorites));
            }
        } catch (error) {
            console.error('Error loading favorites:', error);
        }
    };

    const removeFavorite = async (orchidToRemove) => {
        try {
            const updatedFavorites = favorites.filter(orchid => orchid.name !== orchidToRemove.name);
            await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
            setFavorites(updatedFavorites);
        } catch (error) {
            console.error('Error removing favorite:', error);
        }
    };

    const renderFavoriteItem = ({ item }) => (
        <View style={styles.favoriteItem}>
            <Image source={{ uri: item.image }} style={styles.orchidImage} />
            <View style={styles.orchidInfo}>
                <Text style={styles.orchidName}>{item.name}</Text>
                <Text style={styles.orchidPrice}>${item.price}</Text>
            </View>
            <TouchableOpacity onPress={() => removeFavorite(item)} style={styles.removeButton}>
                <Text style={styles.removeButtonText}>Remove</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            {favorites.length > 0 ? (
                <FlatList
                    data={favorites}
                    renderItem={renderFavoriteItem}
                    keyExtractor={(item) => item.name}
                    onRefresh={onRefresh}
                    refreshing={refreshing}
                />
            ) : (
                <Text style={styles.emptyMessage}>No favorite orchids yet.</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#f0f8f5',
    },
    favoriteItem: {
        flexDirection: 'row',
        padding: 10,
        marginBottom: 10,
        backgroundColor: '#ffffff',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    orchidImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
    },
    orchidInfo: {
        flex: 1,
        marginLeft: 10,
        justifyContent: 'center',
    },
    orchidName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#388e3c',
    },
    orchidPrice: {
        fontSize: 16,
        color: '#2e7d32',
    },
    removeButton: {
        backgroundColor: '#e57373',
        padding: 8,
        borderRadius: 5,
        justifyContent: 'center',
    },
    removeButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
    emptyMessage: {
        fontSize: 18,
        textAlign: 'center',
        marginTop: 50,
        color: '#757575',
    },
});

export default FavoritesScreen;

