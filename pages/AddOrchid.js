import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { get, push, ref, update } from 'firebase/database';
import { getDownloadURL, ref as storageRef, uploadBytes } from 'firebase/storage';
import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { database, storage } from '../firebaseConfig';

const AddOrchid = ({ navigation }) => {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [color, setColor] = useState('');
    const [origin, setOrigin] = useState('');
    const [weight, setWeight] = useState('');
    const [category, setCategory] = useState('');
    const [image, setImage] = useState(null);
    const [imageUrl, setImageUrl] = useState('');
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const categoriesRef = ref(database, 'Categories');
            const snapshot = await get(categoriesRef);
            if (snapshot.exists()) {
                const data = snapshot.val();
                const categoryList = Object.entries(data).map(([key, value]) => ({
                    key,
                    name: value.name
                }));
                setCategories(categoryList);
                if (categoryList.length > 0) {
                    setSelectedCategory(categoryList[0]);
                }
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            Alert.alert('Error', 'Failed to load categories');
        }
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
            setImageUrl(''); 
        }
    };

    const uploadImage = async () => {
        if (image) {
            const response = await fetch(image);
            const blob = await response.blob();
            const filename = `orchids/${name}_${new Date().getTime()}.jpg`;
            const imageRef = storageRef(storage, filename);

            try {
                await uploadBytes(imageRef, blob);
                return await getDownloadURL(imageRef);
            } catch (error) {
                console.error("Error uploading image: ", error);
                throw error;
            }
        } else if (imageUrl) {
            return imageUrl; // If no image is picked, use the entered URL
        }
        throw new Error('No image selected or URL provided');
    };

    const addOrchid = async () => {
        if (!name || !price || !color || !origin || !weight || !selectedCategory || (!image && !imageUrl)) {
            Alert.alert('Error:', 'Please fill all fields and provide an image or image URL');
            return;
        }

        try {
            const finalImageUrl = await uploadImage();
            const newOrchid = {
                name,
                price: parseFloat(price),
                color,
                origin,
                weight: parseInt(weight),
                selectedCategory,
                image: finalImageUrl,
                rating: "0.0",
                isTopOfTheWeek: false,
            };

            const orchidListRef = ref(database, `Categories/${selectedCategory.key}/items`);
            const newOrchidRef = push(orchidListRef);
            await update(newOrchidRef, newOrchid);

            Alert.alert('Success', 'Orchid added successfully');
            navigation.goBack();
        } catch (error) {
            console.error('Error adding orchid:', error);
            Alert.alert('Error', 'Failed to add orchid');
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <TextInput
                style={styles.input}
                placeholder="Orchid Name"
                value={name}
                onChangeText={setName}
            />
            <TextInput
                style={styles.input}
                placeholder="Price"
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
            />
            <TextInput
                style={styles.input}
                placeholder="Color"
                value={color}
                onChangeText={setColor}
            />
            <TextInput
                style={styles.input}
                placeholder="Origin"
                value={origin}
                onChangeText={setOrigin}
            />
            <TextInput
                style={styles.input}
                placeholder="Weight (g)"
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
            />
            <View style={styles.pickerContainer}>
                <Picker
                    selectedValue={selectedCategory}
                    onValueChange={(itemValue) => setSelectedCategory(itemValue)}
                    style={styles.picker}
                >
                    {categories.map((cat) => (
                        <Picker.Item key={cat.key} label={cat.name} value={cat} />
                    ))}
                </Picker>
            </View>
            <TextInput
                style={styles.input}
                placeholder="Image URL (optional)"
                value={imageUrl}
                onChangeText={setImageUrl}
            />
            <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
                <Text style={styles.buttonText}>Pick an image</Text>
            </TouchableOpacity>
            {image && <Image source={{ uri: image }} style={styles.previewImage} />}
            {imageUrl && <Image source={{ uri: imageUrl }} style={styles.previewImage} />}
            <TouchableOpacity style={styles.addButton} onPress={addOrchid}>
                <Text style={styles.buttonText}>Add Orchid</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 10,
        paddingHorizontal: 10,
    },
    imageButton: {
        backgroundColor: '#007AFF',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
    },
    addButton: {
        backgroundColor: 'green',
        padding: 10,
        borderRadius: 5,
    },
    buttonText: {
        color: 'white',
        textAlign: 'center',
    },
    previewImage: {
        width: 200,
        height: 200,
        alignSelf: 'center',
        marginBottom: 10,
    },
    pickerContainer: {
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 10,
    },
    picker: {
        height: 40,
    },
});

export default AddOrchid;
