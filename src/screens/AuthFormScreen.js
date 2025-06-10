import React, { useState } from 'react';
import { View, Text, TextInput, Button, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useFirebase } from '../context/FirebaseContext';
import { useTheme } from '../context/ThemeContext';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const AuthFormScreen = () => {
  const { auth, db } = useFirebase();
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoginMode, setIsLoginMode] = useState(true);

  const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: colors.background },
    title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 30, color: colors.text },
    input: { backgroundColor: colors.card, paddingHorizontal: 15, paddingVertical: 12, borderRadius: 8, fontSize: 16, marginBottom: 15, borderWidth: 1, borderColor: colors.border, color: colors.text },
    buttonContainer: { marginTop: 10 },
    switchTextContainer: { marginTop: 20, alignItems: 'center' },
    baseText: { color: colors.textSecondary },
    switchText: { color: colors.primary, fontWeight: 'bold' },
  });

  const handleAuthentication = async () => {
    try {
      if (isLoginMode) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const newUser = userCredential.user;
        await setDoc(doc(db, "users", newUser.uid), {
          email: newUser.email,
          displayName: newUser.email.split('@')[0],
          createdAt: serverTimestamp(),
        });
      }
    } catch (error) {
      let errorMessage = "Wystąpił błąd. Spróbuj ponownie.";
      if (error.code === 'auth/email-already-in-use') { errorMessage = 'Ten adres e-mail jest już zajęty.'; }
      else if (error.code === 'auth/invalid-credential') { errorMessage = 'Nieprawidłowy e-mail lub hasło.'; }
      else if (error.code === 'auth/invalid-email') { errorMessage = 'Proszę podać poprawny adres e-mail.'; }
      else if (error.code === 'auth/weak-password') { errorMessage = 'Hasło jest zbyt słabe. Powinno mieć co najmniej 6 znaków.'; }
      Alert.alert('Błąd', errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isLoginMode ? 'Logowanie' : 'Rejestracja'}</Text>
      <TextInput style={styles.input} placeholder="Adres e-mail" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholderTextColor={colors.textSecondary} />
      <TextInput style={styles.input} placeholder="Hasło (min. 6 znaków)" value={password} onChangeText={setPassword} secureTextEntry placeholderTextColor={colors.textSecondary} />
      <View style={styles.buttonContainer}>
        <Button title={isLoginMode ? 'Zaloguj się' : 'Zarejestruj się'} onPress={handleAuthentication} color={colors.primary} />
      </View>
      <TouchableOpacity style={styles.switchTextContainer} onPress={() => setIsLoginMode(!isLoginMode)}>
        <Text style={styles.baseText}>{isLoginMode ? 'Nie masz konta? ' : 'Masz już konto? '}<Text style={styles.switchText}>{isLoginMode ? 'Zarejestruj się' : 'Zaloguj się'}</Text></Text>
      </TouchableOpacity>
    </View>
  );
};

export default AuthFormScreen;