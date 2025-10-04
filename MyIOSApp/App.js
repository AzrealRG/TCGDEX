import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView } from 'react-native';

export default function App() {
  const [activeTab, setActiveTab] = useState('Inventory');

  const renderContent = () => {
    switch (activeTab) {
      case 'Inventory':
        return (
          <View style={styles.screenContainer}>
            <Text style={styles.screenTitle}>Inventory</Text>
            <Text style={styles.screenText}>Your card collection will appear here</Text>
          </View>
        );
      case 'Pictures':
        return (
          <View style={styles.screenContainer}>
            <Text style={styles.screenTitle}>Pictures</Text>
            <Text style={styles.screenText}>Card photos and scans will be displayed here</Text>
          </View>
        );
      case 'Settings':
        return (
          <View style={styles.screenContainer}>
            <Text style={styles.screenTitle}>Settings</Text>
            <Text style={styles.screenText}>App preferences and configuration</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="#1a1a1a" />
      
      {/* Main Content Area */}
      <View style={styles.content}>
        {renderContent()}
      </View>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={[styles.navButton, activeTab === 'Inventory' && styles.activeNavButton]}
          onPress={() => setActiveTab('Inventory')}
        >
          <Text style={[styles.navButtonText, activeTab === 'Inventory' && styles.activeNavButtonText]}>
            📦 Inventory
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navButton, activeTab === 'Pictures' && styles.activeNavButton]}
          onPress={() => setActiveTab('Pictures')}
        >
          <Text style={[styles.navButtonText, activeTab === 'Pictures' && styles.activeNavButtonText]}>
            📸 Pictures
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navButton, activeTab === 'Settings' && styles.activeNavButton]}
          onPress={() => setActiveTab('Settings')}
        >
          <Text style={[styles.navButtonText, activeTab === 'Settings' && styles.activeNavButtonText]}>
            ⚙️ Settings
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  screenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  screenText: {
    fontSize: 16,
    color: '#cccccc',
    textAlign: 'center',
    lineHeight: 24,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#2a2a2a',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  activeNavButton: {
    backgroundColor: '#4a4a4a',
  },
  navButtonText: {
    color: '#888888',
    fontSize: 14,
    fontWeight: '500',
  },
  activeNavButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});
