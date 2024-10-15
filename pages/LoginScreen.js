import AsyncStorage from '@react-native-async-storage/async-storage';
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { db } from '../firebaseConfig';

const LoginScreen = ({ navigation }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleLogin = async () => {
        try {
            const q = query(collection(db, 'Accounts'), where('username', '==', username));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                setErrorMessage('Tài khoản không tồn tại');
                return;
            }
            let userFound = false;
            querySnapshot.forEach((doc) => {
                if (doc.data().password === password) {
                    userFound = true;
                }
            });

            if (userFound) {
                await AsyncStorage.setItem('user', username);
                navigation.navigate('OrchidList');
            } else {
                setErrorMessage('Mật khẩu không đúng');
            }
        } catch (error) {
            setErrorMessage('Đăng nhập thất bại: ' + error.message);
        }
    };

    const handleSignUp = async () => {
        try {
            const q = query(collection(db, 'Accounts'), where('username', '==', username));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                setErrorMessage('Tên người dùng đã tồn tại');
                return;
            }
            if (username === '' || password === '') {
                setErrorMessage('Vui loại nhập tài khoản và mật khẩu');
                return;
            }
            await addDoc(collection(db, 'Accounts'), {
                username: username,
                password: password,
            });

            setErrorMessage('Tạo tài khoản thành công. Vui lòng đăng nhập.');
        } catch (error) {
            setErrorMessage('Tạo tài khoản thất bại: ' + error.message);
        }
    };

    return (
        <View style={styles.container}>
            <Image
                source={{ uri: 'https://cdn.discordapp.com/attachments/1133717701211197451/1295420536272322570/IMG_4263.jpg?ex=670e95e3&is=670d4463&hm=897789dd27d37c65f51a830e7fbda6c2a3b0d418dd2c77e5472c24b3c5e49356&' }}
                style={styles.logo}
            />
            <Text style={styles.title}>Tiệm Cây Nhà Boo</Text>
            {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
            <TextInput
                style={styles.input}
                placeholder="Tên đăng nhập"
                placeholderTextColor="#8A8A8A"
                onChangeText={setUsername}
                value={username}
            />
            <TextInput
                style={styles.input}
                placeholder="Mật khẩu"
                placeholderTextColor="#8A8A8A"
                onChangeText={setPassword}
                value={password}
                secureTextEntry
            />
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                <Text style={styles.buttonText}>Đăng nhập</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.signupButton} onPress={handleSignUp}>
                <Text style={styles.buttonText}>Tạo tài khoản</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0F8FF',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    logo: {
        width: 150,
        height: 150,
        borderRadius: 75,
        marginBottom: 30,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 25,
        color: '#2C3E50', 
    },
    error: {
        color: '#E74C3C',
        marginBottom: 10,
        fontSize: 14,
    },
    input: {
        width: '100%',
        height: 50,
        borderColor: 'rgba(0,0,0,0.1)', 
        borderWidth: 1,
        padding: 15,
        marginBottom: 15,
        borderRadius: 8,
        backgroundColor: '#ECF0F1', 
    },
    loginButton: {
        width: '100%',
        backgroundColor: '#3498DB', 
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    signupButton: {
        width: '100%',
        backgroundColor: '#2ECC71', 
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default LoginScreen;
