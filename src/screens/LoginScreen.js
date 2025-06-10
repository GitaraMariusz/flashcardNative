import React from 'react';
import { View, Text, Button, Alert, StyleSheet } from 'react-native';
import { useFirebase } from '../context/FirebaseContext';
import { useTheme } from '../context/ThemeContext';
import { signInAnonymously } from 'firebase/auth';
import { TouchableOpacity } from 'react-native-gesture-handler';

const LoginScreen = ({ navigation }) => {
  const { auth } = useFirebase();
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: colors.background },
    title: { fontSize: 32, fontWeight: 'bold', color: colors.text, marginBottom: 10 },
    subtitle: { fontSize: 16, color: colors.textSecondary, marginBottom: 40, textAlign: 'center' },
    buttonContainer: { width: '100%', alignItems: 'center' },
    switchTextContainer: { marginTop: 20, alignItems: 'center' },
    baseText: { color: colors.textSecondary },
    switchText: { color: colors.primary, fontWeight: 'bold' },
  });

  const handleGuestLogin = async () => {
    if (!auth) {
      Alert.alert('Błąd', 'Usługa autentykacji nie jest gotowa.');
      return;
    }
    try {
      await signInAnonymously(auth);
    } catch (error) {
      console.error('Błąd logowania anonimowego:', error);
      Alert.alert('Błąd', 'Nie udało się zalogować jako gość.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Flashcards App</Text>
      <Text style={styles.subtitle}>Twoja droga do mistrzostwa w nauce!</Text>
      <View style={styles.buttonContainer}>
        <Button title="Zaloguj się lub Zarejestruj" onPress={() => navigation.navigate('AuthForm')} color={colors.primary} />
        <View style={{ marginVertical: 10 }} />
        <Button title="Kontynuuj jako gość" onPress={handleGuestLogin} color={colors.textSecondary} />
      </View>
    </View>
  );
};

export default LoginScreen;