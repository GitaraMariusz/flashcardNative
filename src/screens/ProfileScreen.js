import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, ActivityIndicator, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { useFirebase } from '../context/FirebaseContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const ProfileScreen = ({ navigation }) => {
  const { db } = useFirebase();
  const { user } = useAuth();
  const { theme, toggleTheme, colors } = useTheme();
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(true);

  const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: colors.background },
    label: { fontSize: 16, marginBottom: 8, color: colors.textSecondary },
    input: { backgroundColor: colors.card, paddingHorizontal: 15, paddingVertical: 12, borderRadius: 8, fontSize: 16, marginBottom: 25, borderWidth: 1, borderColor: colors.border, color: colors.text },
    separator: { height: 1, backgroundColor: colors.separator, marginVertical: 30 },
    themeContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

    customButton: {
      backgroundColor: colors.card,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 8,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    customButtonText: {
      color: colors.text,
      fontSize: 16,
      fontWeight: 'bold',
    },
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setDisplayName(userDoc.data().displayName);
        } else {
          setDisplayName(user.email.split('@')[0]);
        }
        setLoading(false);
      }
    };
    fetchUserData();
  }, [user]);

  const handleSaveProfile = async () => {
    if (displayName.trim().length < 3) {
      Alert.alert('Błąd', 'Nazwa wyświetlana musi mieć co najmniej 3 znaki.');
      return;
    }
    const userDocRef = doc(db, 'users', user.uid);
    try {
      await setDoc(userDocRef, { displayName: displayName }, { merge: true });
      Alert.alert('Sukces', 'Profil został zaktualizowany.');
      navigation.goBack();
    } catch (error) {
      console.error("Błąd zapisu profilu: ", error);
      Alert.alert('Błąd', 'Nie udało się zaktualizować profilu.');
    }
  };

  if (loading) {
    return <ActivityIndicator style={{ flex: 1, backgroundColor: colors.background }} size="large" color={colors.primary} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Twoja nazwa wyświetlana:</Text>
      <TextInput style={styles.input} value={displayName} onChangeText={setDisplayName} placeholderTextColor={colors.textSecondary} />
      <Button title="Zapisz zmiany" onPress={handleSaveProfile} color={colors.primary} />
      <View style={styles.separator} />
      <View style={styles.themeContainer}>
        <Text style={styles.label}>Tryb ciemny</Text>
        <Switch value={theme === 'dark'} onValueChange={toggleTheme} trackColor={{ false: "#767577", true: colors.primary }} />
      </View>
      <View style={styles.separator} />

      <TouchableOpacity
        style={styles.customButton}
        onPress={() => navigation.navigate('Stats')}
      >
        <Text style={styles.customButtonText}>Zobacz moje statystyki</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ProfileScreen;