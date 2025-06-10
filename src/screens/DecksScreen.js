import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, Button, ActivityIndicator, StyleSheet, Alert, Switch, TextInput, Animated } from 'react-native';
import { useFirebase } from '../context/FirebaseContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { collection, onSnapshot, query, doc, deleteDoc, getDocs, where, setDoc, documentId } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

const DecksScreen = ({ navigation }) => {
  const { db, auth } = useFirebase();
  const { user } = useAuth();
  const { colors } = useTheme();

  const [allDecks, setAllDecks] = useState([]);
  const [usersMap, setUsersMap] = useState(new Map());
  const [likedDecks, setLikedDecks] = useState(new Set());
  const [combinedDecks, setCombinedDecks] = useState([]);
  const [filteredDecks, setFilteredDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOnlyMyDecks, setShowOnlyMyDecks] = useState(false);
  const [showOnlyLikedDecks, setShowOnlyLikedDecks] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPanelVisible, setIsPanelVisible] = useState(false);
  const panelAnimation = useRef(new Animated.Value(0)).current;

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    placeholderText: { fontSize: 16, color: colors.textSecondary },
    list: { paddingHorizontal: 15 },
    deckItem: { backgroundColor: colors.card, padding: 20, borderRadius: 8, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
    deckTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text },
    deckInfo: { fontSize: 14, color: colors.textSecondary, marginTop: 5 },
    headerButtons: { flexDirection: 'row' },
    headerButton: { marginRight: 20 },
    deckContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    deckInfoContainer: { flex: 1 },
    deckActions: { flexDirection: 'row' },
    actionButton: { paddingHorizontal: 5 },
    creatorInfo: { fontSize: 12, color: colors.textSecondary, marginTop: 5 },
    controlsPanel: { backgroundColor: colors.card, borderRadius: 8, margin: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
    panelContent: { padding: 15 },
    searchInput: { backgroundColor: colors.background, paddingHorizontal: 15, paddingVertical: 10, borderRadius: 8, fontSize: 16, borderWidth: 1, borderColor: colors.border, color: colors.text },
    separator: { height: 1, backgroundColor: colors.separator, marginVertical: 12 },
    filterContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    filterText: { fontSize: 16, color: colors.text },
  });

  const handleLogout = async () => { try { await signOut(auth); } catch (e) { console.error(e); } };
  const togglePanel = () => {
    const toValue = isPanelVisible ? 0 : 1;
    Animated.timing(panelAnimation, { toValue, duration: 300, useNativeDriver: false }).start();
    setIsPanelVisible(!isPanelVisible);
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerButtons}>
          {user && !user.isAnonymous && (
            <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.headerButton}>
              <Ionicons name="person-circle-outline" size={28} color={colors.icon} />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={togglePanel} style={styles.headerButton}>
            <Ionicons name={isPanelVisible ? "close" : "options-outline"} size={26} color={colors.icon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={styles.headerButton}>
            <Ionicons name="exit-outline" size={26} color={colors.icon} />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, auth, isPanelVisible, user, colors]);

  useEffect(() => {
    const usersCollectionRef = collection(db, 'users');
    const unsubscribe = onSnapshot(usersCollectionRef, (snapshot) => {
      const newUsersMap = new Map();
      snapshot.forEach(doc => newUsersMap.set(doc.id, doc.data()));
      setUsersMap(newUsersMap);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const likedDecksRef = collection(db, 'users', user.uid, 'likedDecks');
    const unsubscribe = onSnapshot(likedDecksRef, (snapshot) => {
      const newLikedDecks = new Set();
      snapshot.forEach(doc => newLikedDecks.add(doc.id));
      setLikedDecks(newLikedDecks);
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    let decksCollectionRef = collection(db, 'decks');
    let q;
    if (showOnlyMyDecks) {
      q = query(decksCollectionRef, where("userId", "==", user.uid));
    } else if (showOnlyLikedDecks) {
      if (likedDecks.size === 0) {
        setAllDecks([]);
        setLoading(false);
        return;
      }
      q = query(decksCollectionRef, where(documentId(), 'in', Array.from(likedDecks)));
    } else {
      q = query(decksCollectionRef);
    }
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedDecks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAllDecks(fetchedDecks);
      setLoading(false);
    }, (error) => {
      console.error("Błąd subskrypcji do zestawów: ", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user, showOnlyMyDecks, showOnlyLikedDecks, likedDecks]);

  useEffect(() => {
    const combined = allDecks.map(deck => ({
      ...deck,
      creatorName: usersMap.get(deck.userId)?.displayName || usersMap.get(deck.userId)?.email || 'Nieznany'
    }));
    setCombinedDecks(combined);
  }, [allDecks, usersMap]);

  useEffect(() => {
    let decksToFilter = [...combinedDecks];
    if (searchQuery.trim() !== '') {
      decksToFilter = decksToFilter.filter(deck =>
        deck.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredDecks(decksToFilter);
  }, [searchQuery, combinedDecks]);

  const handleDeleteDeck = async (deckId) => {
    const cardsCollectionRef = collection(db, 'decks', deckId, 'flashcards');
    const querySnapshot = await getDocs(cardsCollectionRef);
    const deletePromises = querySnapshot.docs.map((cardDoc) =>
      deleteDoc(doc(db, 'decks', deckId, 'flashcards', cardDoc.id))
    );
    await Promise.all(deletePromises);
    const deckDocRef = doc(db, 'decks', deckId);
    await deleteDoc(deckDocRef);
  };

  const confirmDelete = (deckId, deckTitle) => {
    Alert.alert("Potwierdź usunięcie", `Czy na pewno chcesz usunąć zestaw "${deckTitle}"? Tej operacji nie można cofnąć.`,
      [{ text: "Anuluj", style: "cancel" }, { text: "Usuń", style: "destructive", onPress: () => handleDeleteDeck(deckId) }]
    );
  };

  const handleLikeToggle = async (deckId, isLiked) => {
    if (!user || user.isAnonymous) {
      Alert.alert("Funkcja niedostępna", "Zaloguj się, aby polubić zestawy.");
      return;
    }
    const likeDocRef = doc(db, 'users', user.uid, 'likedDecks', deckId);
    try {
      if (isLiked) {
        await deleteDoc(likeDocRef);
      } else {
        await setDoc(likeDocRef, { likedAt: new Date() });
      }
    } catch (error) {
      console.error("Błąd podczas zmiany polubienia: ", error);
    }
  };

  if (loading) { return <View style={styles.placeholder}><ActivityIndicator size="large" color={colors.primary} /></View>; }

  const renderDeck = ({ item }) => {
    const isLiked = likedDecks.has(item.id);
    return (
      <TouchableOpacity style={styles.deckItem} onPress={() => navigation.navigate('Study', { deckId: item.id, deckTitle: item.title, ownerId: item.userId })}>
        <View style={styles.deckContent}>
          <View style={styles.deckInfoContainer}>
            <Text style={styles.deckTitle}>{item.title}</Text>
            <Text style={styles.deckInfo}>Liczba fiszek: {item.cardCount}</Text>
            {item.creatorName && <Text style={styles.creatorInfo}>Stworzone przez: {item.creatorName}</Text>}
          </View>
          <View style={styles.deckActions}>
            {user && !user.isAnonymous && (
              <TouchableOpacity onPress={() => handleLikeToggle(item.id, isLiked)} style={styles.actionButton}>
                <Ionicons name={isLiked ? "heart" : "heart-outline"} size={26} color={isLiked ? colors.danger : colors.textSecondary} />
              </TouchableOpacity>
            )}
            {user && user.uid === item.userId && (
              <TouchableOpacity onPress={() => confirmDelete(item.id, item.title)} style={styles.actionButton}>
                <Ionicons name="trash-bin-outline" size={24} color={colors.danger} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const panelHeight = panelAnimation.interpolate({ inputRange: [0, 1], outputRange: [0, 260] });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.controlsPanel, { height: panelHeight, overflow: 'hidden' }]}>
        <View style={{ padding: 5 }}>
          <TextInput style={styles.searchInput} placeholder="Wyszukaj zestaw..." value={searchQuery} onChangeText={setSearchQuery} placeholderTextColor={colors.textSecondary} />
          {user && !user.isAnonymous && (
            <>
              <View style={styles.separator} />
              <View style={styles.filterContainer}>
                <Text style={styles.filterText}>Pokaż tylko moje zestawy</Text>
                <Switch trackColor={{ false: "#767577", true: colors.primary }} onValueChange={(value) => { setShowOnlyMyDecks(value); if (value) setShowOnlyLikedDecks(false); }} value={showOnlyMyDecks} />
              </View>
              <View style={styles.separator} />
              <View style={styles.filterContainer}>
                <Text style={styles.filterText}>Pokaż tylko polubione</Text>
                <Switch trackColor={{ false: "#767577", true: colors.primary }} onValueChange={(value) => { setShowOnlyLikedDecks(value); if (value) setShowOnlyMyDecks(false); }} value={showOnlyLikedDecks} />
              </View>
              <View style={styles.separator} />
              <Button title="Stwórz nowy zestaw" onPress={() => navigation.navigate('CreateDeck')} color={colors.primary} />
            </>
          )}
        </View>
      </Animated.View>
      <FlatList data={filteredDecks} renderItem={renderDeck} keyExtractor={item => item.id} contentContainerStyle={styles.list} ListEmptyComponent={<View style={styles.placeholder}><Text style={styles.placeholderText}>Brak dostępnych zestawów.</Text></View>} />
    </View>
  );
};

export default DecksScreen;