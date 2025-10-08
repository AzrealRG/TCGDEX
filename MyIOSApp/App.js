import { StatusBar } from 'expo-status-bar';
import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Alert, Image } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';

export default function App() {
  const [activeTab, setActiveTab] = useState('Inventory');
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const cameraRef = useRef(null);

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
        });
        setCapturedPhoto(photo);
      } catch (error) {
        Alert.alert('Error', 'Failed to take picture');
      }
    }
  };

  const retakePicture = () => {
    setCapturedPhoto(null);
  };

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
        if (!permission) {
          // Camera permissions are still loading
          return (
            <View style={styles.screenContainer}>
              <Text style={styles.screenTitle}>Loading Camera...</Text>
            </View>
          );
        }

        if (!permission.granted) {
          // Camera permissions are not granted yet
          return (
            <View style={styles.screenContainer}>
              <Text style={styles.screenTitle}>Camera Permission</Text>
              <Text style={styles.screenText}>We need your permission to use the camera</Text>
              <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
                <Text style={styles.permissionButtonText}>Grant Permission</Text>
              </TouchableOpacity>
            </View>
          );
        }

        if (capturedPhoto) {
          // Show captured photo with options
          return (
            <View style={styles.screenContainer}>
              <Image source={{ uri: capturedPhoto.uri }} style={styles.capturedImage} />
              <View style={styles.photoActions}>
                <TouchableOpacity style={styles.actionButton} onPress={retakePicture}>
                  <Text style={styles.actionButtonText}>Retake</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, styles.saveButton]} onPress={() => Alert.alert('Saved', 'Photo saved to gallery!')}>
                  <Text style={[styles.actionButtonText, styles.saveButtonText]}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }

        // Show camera view
        return (
          <View style={styles.cameraContainer}>
            <CameraView style={styles.camera} facing="back" ref={cameraRef}>
              <View style={styles.cameraOverlay}>
                <View style={styles.cameraHeader}>
                  <Text style={styles.cameraTitle}>📸 Take Card Photo</Text>
                </View>
                <View style={styles.cameraFooter}>
                  <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
                    <View style={styles.captureButtonInner} />
                  </TouchableOpacity>
                </View>
              </View>
            </CameraView>
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
            Dex
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navButton, activeTab === 'Pictures' && styles.activeNavButton]}
          onPress={() => setActiveTab('Pictures')}
        >
          <Text style={[styles.navButtonText, activeTab === 'Pictures' && styles.activeNavButtonText]}>
            Pictures
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navButton, activeTab === 'Settings' && styles.activeNavButton]}
          onPress={() => setActiveTab('Settings')}
        >
          <Text style={[styles.navButtonText, activeTab === 'Settings' && styles.activeNavButtonText]}>
            Settings
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
  // Camera styles
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
  },
  cameraHeader: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  cameraTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cameraFooter: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: 30,
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#cccccc',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#666666',
  },
  // Photo preview styles
  capturedImage: {
    width: '100%',
    height: '70%',
    resizeMode: 'contain',
    borderRadius: 10,
  },
  photoActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 40,
    marginTop: 20,
  },
  actionButton: {
    backgroundColor: '#4a4a4a',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#ffffff',
  },
  // Permission styles
  permissionButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 20,
  },
  permissionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
