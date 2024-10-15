import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { get, ref, remove, update } from 'firebase/database';
import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { database } from '../firebaseConfig';

const OrchidDetail = ({ route, navigation }) => {
    const { orchid, categoryName } = route.params;
    const [isFavorite, setIsFavorite] = useState(false);
    const [editableOrchid, setEditableOrchid] = useState({ ...orchid, category: categoryName });
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        checkFavoriteStatus();
        fetchCategories();
    }, []);

    const checkFavoriteStatus = async () => {
        try {
            const favorites = await AsyncStorage.getItem('favorites');
            if (favorites !== null) {
                const favoritesArray = JSON.parse(favorites);
                setIsFavorite(favoritesArray.some(fav => fav.name === orchid.name));
            }
        } catch (error) {
            console.error('Error checking favorite status:', error);
        }
    };

    const fetchCategories = async () => {
        try {
            const categoriesRef = ref(database, 'Categories');
            const snapshot = await get(categoriesRef);
            if (snapshot.exists()) {
                const data = snapshot.val();
                const categoryList = Object.values(data).map(category => category.name);
                setCategories(categoryList);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const toggleFavorite = async () => {
        try {
            const favorites = await AsyncStorage.getItem('favorites');
            let favoritesArray = favorites ? JSON.parse(favorites) : [];

            if (isFavorite) {
                favoritesArray = favoritesArray.filter(fav => fav.name !== orchid.name);
            } else {
                favoritesArray.push(orchid);
            }

            await AsyncStorage.setItem('favorites', JSON.stringify(favoritesArray));
            setIsFavorite(!isFavorite);
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };

    const updateOrchid = async () => {
        try {
            const categoriesRef = ref(database, 'Categories');
            const snapshot = await get(categoriesRef);

            if (snapshot.exists()) {
                const categoriesObject = snapshot.val();
                if (!categoriesObject) {
                    throw new Error("Categories data is empty");
                }

                const categories = Object.values(categoriesObject);
                if (categories.length === 0) {
                    throw new Error("No categories found");
                }

                let oldCategoryIndex, itemKey;

                for (let index = 0; index < categories.length; index++) {
                    const category = categories[index];
                    if (category.items) {
                        const itemEntry = Object.entries(category.items).find(([key, item]) => item && item.name === orchid.name);
                        if (itemEntry) {
                            oldCategoryIndex = index;
                            itemKey = itemEntry[0];
                            break;
                        }
                    }
                }

                if (oldCategoryIndex === undefined || itemKey === undefined) {
                    throw new Error("Orchid not found in any category");
                }

                const oldCategoryKey = Object.keys(categoriesObject)[oldCategoryIndex];
                const oldOrchidRef = ref(database, `Categories/${oldCategoryKey}/items/${itemKey}`);
                await update(oldOrchidRef, editableOrchid);

                if (categories[oldCategoryIndex].name !== editableOrchid.category) {
                    const newCategoryIndex = categories.findIndex(category => category.name === editableOrchid.category);
                    if (newCategoryIndex === -1) {
                        throw new Error("New category not found");
                    }

                    const newCategoryKey = Object.keys(categoriesObject)[newCategoryIndex];
                    const newOrchidRef = ref(database, `Categories/${newCategoryKey}/items/${itemKey}`);
                    await update(newOrchidRef, editableOrchid);

                    await remove(oldOrchidRef);
                }

                Alert.alert("Success", "Orchid updated successfully");
                navigation.goBack();
            } else {
                throw new Error("No data found in database");
            }
        } catch (error) {
            console.error("Error updating orchid:", error);
            Alert.alert("Error", "Failed to update orchid: " + error.message);
        }
    };

    const deleteOrchid = async () => {
        Alert.alert(
            "Delete Orchid",
            "Are you sure you want to delete this orchid?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "OK", onPress: async () => {
                        try {
                            const categoriesRef = ref(database, 'Categories');
                            const snapshot = await get(categoriesRef);

                            if (snapshot.exists()) {
                                const categories = snapshot.val();
                                let categoryName, itemKey;

                                for (const [catName, catData] of Object.entries(categories)) {
                                    const itemEntry = Object.entries(catData.items).find(([key, item]) => item.name === orchid.name);
                                    if (itemEntry) {
                                        categoryName = catName;
                                        itemKey = itemEntry[0];
                                        break;
                                    }
                                }

                                if (categoryName && itemKey) {
                                    const orchidRef = ref(database, `Categories/${categoryName}/items/${itemKey}`);
                                    await remove(orchidRef);
                                    Alert.alert("Success", "Orchid deleted successfully");
                                    navigation.goBack();
                                } else {
                                    throw new Error("Orchid not found in database");
                                }
                            }
                        } catch (error) {
                            console.error("Error deleting orchid:", error);
                            Alert.alert("Error", "Failed to delete orchid");
                        }
                    }
                }
            ]
        );
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Image source={{ uri: editableOrchid.image }} style={styles.image} />
            <TextInput
                style={styles.input}
                value={editableOrchid.name}
                onChangeText={(text) => setEditableOrchid({ ...editableOrchid, name: text })}
                placeholder="Name"
            />
            <TextInput
                style={styles.input}
                value={editableOrchid.price?.toString() || ''}
                onChangeText={(text) => {
                    if (text === '') {
                        setEditableOrchid({ ...editableOrchid, price: null });
                    } else {
                        const price = parseFloat(text);
                        if (!isNaN(price)) {
                            setEditableOrchid({ ...editableOrchid, price: price });
                        }
                    }
                }}
                keyboardType="numeric"
                placeholder="Price"
            />

            <TextInput
                style={styles.input}
                value={editableOrchid.color}
                onChangeText={(text) => setEditableOrchid({ ...editableOrchid, color: text })}
                placeholder="Color"
            />
            <TextInput
                style={styles.input}
                value={editableOrchid.origin}
                onChangeText={(text) => setEditableOrchid({ ...editableOrchid, origin: text })}
                placeholder="Origin"
            />
            <TextInput
                style={styles.input}
                value={editableOrchid.weight?.toString() || ''}
                onChangeText={(text) => {
                    if (text === '') {
                        setEditableOrchid({ ...editableOrchid, weight: null });
                    } else {
                        const weight = parseInt(text);
                        if (!isNaN(weight)) {
                            setEditableOrchid({ ...editableOrchid, weight: weight });
                        }
                    }
                }}
                keyboardType="numeric"
                placeholder="Weight"
            />

            <TextInput
                style={styles.input}
                value={editableOrchid.rating}
                onChangeText={(text) => setEditableOrchid({ ...editableOrchid, rating: text })}
                placeholder="Rating"
            />
            <TextInput
                style={styles.input}
                value={editableOrchid.image}
                onChangeText={(text) => setEditableOrchid({ ...editableOrchid, image: text })}
                placeholder="Image URL"
            />

            <View style={styles.pickerContainer}>
                <Picker
                    selectedValue={editableOrchid.category}
                    style={styles.picker}
                    onValueChange={(itemValue) => setEditableOrchid({ ...editableOrchid, category: itemValue })}
                >
                    {categories.map((category, index) => (
                        <Picker.Item key={index} label={category} value={category} />
                    ))}
                </Picker>
            </View>

            <TouchableOpacity style={styles.favoriteButton} onPress={toggleFavorite}>
                <Text style={styles.buttonText}>{isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.updateButton} onPress={updateOrchid}>
                <Text style={styles.buttonText}>Update Orchid</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.deleteButton} onPress={deleteOrchid}>
                <Text style={styles.buttonText}>Delete Orchid</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        alignItems: 'center',
        backgroundColor: '#f4f4f9',
    },
    image: {
        width: 200,
        height: 200,
        marginBottom: 20,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    input: {
        width: '100%',
        padding: 10,
        marginVertical: 8,
        borderRadius: 5,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#8bc34a',
    },
    pickerContainer: {
        width: '100%',
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#8bc34a',
        marginBottom: 15,
        backgroundColor: '#fff',
    },
    picker: {
        width: '100%',
    },
    favoriteButton: {
        width: '100%',
        padding: 15,
        backgroundColor: '#81c784',
        borderRadius: 5,
        marginVertical: 10,
    },
    updateButton: {
        width: '100%',
        padding: 15,
        backgroundColor: '#ffb74d',
        borderRadius: 5,
        marginVertical: 10,
    },
    deleteButton: {
        width: '100%',
        padding: 15,
        backgroundColor: '#e57373',
        borderRadius: 5,
        marginVertical: 10,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default OrchidDetail;
