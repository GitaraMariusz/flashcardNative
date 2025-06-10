import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Button, ActivityIndicator, StyleSheet, Alert, Animated } from 'react-native';
import { useFirebase } from '../context/FirebaseContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { collection, onSnapshot, query, doc, deleteDoc, updateDoc, increment } from 'firebase/firestore';

const StudyScreen = ({ route, navigation }) => {
  const { db } = useFirebase();
  const { user } = useAuth();
  const { colors } = useTheme();
  const { deckId, ownerId } = route.params;

  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background, padding: 20 },
    card: { width: '100%', height: 300, backgroundColor: colors.card, borderRadius: 12, justifyContent: 'center', alignItems: 'center', padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 5 },
    cardText: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', color: colors.text },
    controls: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginTop: 40 },
    addButton: { marginRight: 15 },
    iconsContainer: { position: 'absolute', top: 10, right: 10, flexDirection: 'row', zIndex: 1 },
    iconButton: { padding: 5, marginLeft: 10 },
    touchableCardContent: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
    progressContainer: { marginTop: 20, alignItems: 'center' },
    progressText: { fontSize: 16, color: colors.textSecondary, fontWeight: '500' },
  });

  useLayoutEffect(() => {
    if (user && user.uid === ownerId) {
      navigation.setOptions({
        headerRight: () => (
          <TouchableOpacity onPress={() => navigation.navigate('AddCard', { deckId: deckId })} style={styles.addButton}>
            <Ionicons name="add-circle" size={32} color={colors.success} />
          </TouchableOpacity>
        ),
      });
    }
  }, [navigation, user, ownerId, deckId, colors]);

  useEffect(() => {
    if (!deckId) return;
    const cardsCollectionRef = collection(db, 'decks', deckId, 'flashcards');
    const q = query(cardsCollectionRef);
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedCards = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCards(fetchedCards);
      if (currentIndex >= fetchedCards.length && fetchedCards.length > 0) {
        setCurrentIndex(fetchedCards.length - 1);
      } else if (fetchedCards.length === 0) {
        setCurrentIndex(0);
      }
      setLoading(false);
    }, (error) => {
      console.error("Błąd subskrypcji do fiszek: ", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [deckId]);

  const handleDeleteCard = async (cardId) => {
    try {
      const cardDocRef = doc(db, 'decks', deckId, 'flashcards', cardId);
      await deleteDoc(cardDocRef);
      const deckDocRef = doc(db, 'decks', deckId);
      await updateDoc(deckDocRef, { cardCount: increment(-1) });
    } catch (error) {
      console.error("Błąd podczas usuwania fiszki: ", error);
      Alert.alert('Błąd', 'Nie udało się usunąć fiszki.');
    }
  };

  const confirmDeleteCard = (cardId, cardQuestion) => {
    Alert.alert("Potwierdź usunięcie", `Czy na pewno chcesz usunąć fiszkę z pytaniem: "${cardQuestion}"?`,
      [{ text: "Anuluj", style: "cancel" }, { text: "Usuń", style: "destructive", onPress: () => handleDeleteCard(cardId) }]
    );
  };

  const handleFlip = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setIsFlipped(!isFlipped);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleNext = () => {
    if (cards.length > 0) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setIsFlipped(false);
        setCurrentIndex((prevIndex) => (prevIndex + 1) % cards.length);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    }
  };

  if (loading) { return <View style={styles.container}><ActivityIndicator size="large" color={colors.primary} /></View>; }
  if (cards.length === 0) { return <View style={styles.container}><Text style={styles.cardText}>Ten zestaw nie ma jeszcze żadnych fiszek!</Text></View>; }
  const currentCard = cards[currentIndex];
  if (!currentCard) { return <View style={styles.container}><ActivityIndicator size="large" color={colors.primary} /></View>; }

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
        <TouchableOpacity onPress={handleFlip} style={styles.touchableCardContent}>
          {user && user.uid === ownerId && (
            <View style={styles.iconsContainer}>
              <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('EditCard', { deckId: deckId, card: currentCard })}>
                <Ionicons name="pencil" size={24} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={() => confirmDeleteCard(currentCard.id, currentCard.question)}>
                <Ionicons name="trash" size={24} color={colors.danger} />
              </TouchableOpacity>
            </View>
          )}
          <Text style={styles.cardText}>{isFlipped ? currentCard.answer : currentCard.question}</Text>
        </TouchableOpacity>
      </Animated.View>
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>Karta {currentIndex + 1} / {cards.length}</Text>
      </View>
      <View style={styles.controls}>
        <Button title={isFlipped ? "Pokaż pytanie" : "Pokaż odpowiedź"} onPress={handleFlip} color={colors.primary} />
        <Button title="Następna" onPress={handleNext} color={colors.success} disabled={cards.length <= 1} />
      </View>
    </View>
  );
};

export default StudyScreen;