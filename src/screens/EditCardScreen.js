import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { useFirebase } from '../context/FirebaseContext';
import { useTheme } from '../context/ThemeContext';
import { doc, updateDoc } from 'firebase/firestore';

const EditCardScreen = ({ route, navigation }) => {
  const { db } = useFirebase();
  const { colors } = useTheme();
  const { deckId, card } = route.params;

  const [question, setQuestion] = useState(card.question);
  const [answer, setAnswer] = useState(card.answer);

  const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: colors.background },
    label: { fontSize: 16, marginBottom: 8, color: colors.textSecondary },
    input: { backgroundColor: colors.card, paddingHorizontal: 15, paddingVertical: 12, borderRadius: 8, fontSize: 16, marginBottom: 20, borderWidth: 1, borderColor: colors.border, color: colors.text },
  });

  const handleEditCard = async () => {
    if (question.trim() === '' || answer.trim() === '') {
      Alert.alert('Błąd', 'Pytanie i odpowiedź nie mogą być puste.');
      return;
    }
    try {
      const cardDocRef = doc(db, 'decks', deckId, 'flashcards', card.id);
      await updateDoc(cardDocRef, {
        question: question,
        answer: answer,
      });
      navigation.goBack();
    } catch (error) {
      console.error("Błąd podczas edycji fiszki: ", error);
      Alert.alert('Błąd', 'Nie udało się zaktualizować fiszki.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Edytuj pytanie:</Text>
      <TextInput style={styles.input} value={question} onChangeText={setQuestion} placeholderTextColor={colors.textSecondary} />
      <Text style={styles.label}>Edytuj odpowiedź:</Text>
      <TextInput style={styles.input} value={answer} onChangeText={setAnswer} placeholderTextColor={colors.textSecondary} />
      <Button title="Zapisz zmiany" onPress={handleEditCard} color={colors.primary} />
    </View>
  );
};

export default EditCardScreen;