import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { useFirebase } from '../context/FirebaseContext';
import { useTheme } from '../context/ThemeContext';
import { collection, doc, addDoc, updateDoc, increment } from 'firebase/firestore';

const AddCardScreen = ({ route, navigation }) => {
  const { db } = useFirebase();
  const { colors } = useTheme();
  const { deckId } = route.params;

  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');


  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: colors.background,
    },
    label: {
      fontSize: 16,
      marginBottom: 8,
      color: colors.textSecondary,
    },
    input: {
      backgroundColor: colors.card,
      paddingHorizontal: 15,
      paddingVertical: 12,
      borderRadius: 8,
      fontSize: 16,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.border,
      color: colors.text,
    },
  });


  const handleAddCard = async () => {
    if (question.trim() === '' || answer.trim() === '') {
      Alert.alert('Błąd', 'Pytanie i odpowiedź nie mogą być puste.');
      return;
    }

    try {
      const cardsCollectionRef = collection(db, 'decks', deckId, 'flashcards');
      await addDoc(cardsCollectionRef, {
        question: question,
        answer: answer,
      });

      const deckDocRef = doc(db, 'decks', deckId);
      await updateDoc(deckDocRef, {
        cardCount: increment(1)
      });

      navigation.goBack();

    } catch (error) {
      console.error("Błąd podczas dodawania fiszki: ", error);
      Alert.alert('Błąd', 'Nie udało się dodać fiszki.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Pytanie:</Text>
      <TextInput
        style={styles.input}
        placeholder="np. Stolica Hiszpanii?"
        placeholderTextColor={colors.textSecondary}
        value={question}
        onChangeText={setQuestion}
      />
      <Text style={styles.label}>Odpowiedź:</Text>
      <TextInput
        style={styles.input}
        placeholder="np. Madryt"
        placeholderTextColor={colors.textSecondary}
        value={answer}
        onChangeText={setAnswer}
      />
      <Button title="Dodaj fiszkę" onPress={handleAddCard} color={colors.primary} />
    </View>
  );
};

export default AddCardScreen;