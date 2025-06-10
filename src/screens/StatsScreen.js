import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useFirebase } from '../context/FirebaseContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { collection, query, where, getDocs, getCountFromServer } from 'firebase/firestore';

const StatCard = ({ value, label, colors }) => {
  const styles = StyleSheet.create({
    statBox: { backgroundColor: colors.card, padding: 20, borderRadius: 8, marginBottom: 15, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
    statValue: { fontSize: 36, fontWeight: 'bold', color: colors.text },
    statLabel: { fontSize: 16, color: colors.textSecondary, marginTop: 5 },
  });
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
};

const StatsScreen = () => {
  const { db } = useFirebase();
  const { user } = useAuth();
  const { colors } = useTheme();
  const [stats, setStats] = useState({ createdDecks: 0, totalCards: 0, likedDecks: 0 });
  const [loading, setLoading] = useState(true);

  const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: colors.background },
  });

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      try {
        const decksRef = collection(db, 'decks');
        const myDecksQuery = query(decksRef, where("userId", "==", user.uid));
        const myDecksSnapshot = await getDocs(myDecksQuery);
        const createdDecksCount = myDecksSnapshot.size;
        let totalCardsCount = 0;
        myDecksSnapshot.forEach(deckDoc => { totalCardsCount += deckDoc.data().cardCount || 0; });
        const likedDecksRef = collection(db, 'users', user.uid, 'likedDecks');
        const likedDecksSnapshot = await getCountFromServer(likedDecksRef);
        const likedDecksCount = likedDecksSnapshot.data().count;
        setStats({ createdDecks: createdDecksCount, totalCards: totalCardsCount, likedDecks: likedDecksCount });
      } catch (error) {
        console.error("Błąd podczas pobierania statystyk: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user]);

  if (loading) {
    return <ActivityIndicator style={{ flex: 1, backgroundColor: colors.background }} size="large" color={colors.primary} />;
  }

  return (
    <View style={styles.container}>
      <StatCard value={stats.createdDecks} label="Stworzonych zestawów" colors={colors} />
      <StatCard value={stats.totalCards} label="Łącznie fiszek" colors={colors} />
      <StatCard value={stats.likedDecks} label="Polubionych zestawów" colors={colors} />
    </View>
  );
};

export default StatsScreen;