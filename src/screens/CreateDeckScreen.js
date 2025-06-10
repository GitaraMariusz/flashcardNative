import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { useFirebase } from '../context/FirebaseContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const CreateDeckScreen = ({ navigation }) => {
  const { db } = useFirebase();
  const { user } = useAuth();
  const { colors } = useTheme();
  const [title, setTitle] = useState('');

  const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: colors.background },
    label: { fontSize: 16, marginBottom: 8, color: colors.textSecondary },
    input: { backgroundColor: colors.card, paddingHorizontal: 15, paddingVertical: 12, borderRadius: 8, fontSize: 16, marginBottom: 25, borderWidth: 1, borderColor: colors.border, color: colors.text },
  });

  const handleCreateDeck = async () => {
    if (title.trim() === '') {
      Alert.alert('Błąd', 'Tytuł zestawu nie może być pusty.');
      return;
    }
    try {
      const decksCollectionRef = collection(db, 'decks');
      await addDoc(decksCollectionRef, {
        title: title,
        cardCount: 0,
        createdAt: serverTimestamp(),
        userId: user.uid,
        userEmail: user.email,
      });
      navigation.goBack();
    } catch (error) {
      console.error("Błąd podczas tworzenia zestawu: ", error);
      Alert.alert('Błąd', 'Nie udało się utworzyć zestawu.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Tytuł nowego zestawu:</Text>
      <TextInput style={styles.input} placeholder="np. Słówka Hiszpańskie" value={title} onChangeText={setTitle} placeholderTextColor={colors.textSecondary} />
      <Button title="Stwórz zestaw" onPress={handleCreateDeck} color={colors.primary} />
    </View>
  );
};

export default CreateDeckScreen;