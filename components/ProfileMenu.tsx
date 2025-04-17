import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Dimensions, Alert } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useAuth } from '@/lib/context/AuthContext';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

export function ProfileMenu() {
  const { signOut, isAuthenticated } = useAuth();
  const [menuVisible, setMenuVisible] = useState(false);

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const handleSignOut = async () => {
    setMenuVisible(false);
    console.log("Начало выхода из аккаунта, текущий статус:", isAuthenticated);
    
    try {
      const { error } = await signOut();
      
      if (error) {
        console.error('Ошибка при выходе из аккаунта:', error);
        Alert.alert("Ошибка", "Не удалось выйти из аккаунта: " + error.message);
      } else {
        console.log("Успешный выход");
        
        // Принудительно перенаправляем на экран входа
        router.replace('/auth/login');
      }
    } catch (e) {
      console.error('Непредвиденная ошибка при выходе:', e);
      Alert.alert("Ошибка", "Произошла непредвиденная ошибка при выходе");
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={toggleMenu} style={styles.profileButton}>
        <FontAwesome5 name="user" size={24} color="#000" />
      </TouchableOpacity>

      <Modal
        transparent
        visible={menuVisible}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuContainer}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={handleSignOut}
            >
              <FontAwesome5 name="sign-out-alt" size={20} color="#000" style={styles.menuIcon} />
              <Text style={styles.menuText}>ВЫХОД</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 36,
    right: 16,
    zIndex: 100,
  },
  profileButton: {
    width: 48,
    height: 48,
    borderWidth: 3,
    borderColor: '#000',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuContainer: {
    position: 'absolute',
    top: 88,
    right: 16,
    width: 160,
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: '#000',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  menuIcon: {
    marginRight: 12,
  },
  menuText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
}); 