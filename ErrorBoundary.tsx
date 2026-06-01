import React, { Component, ReactNode } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { showAlert } from './lib/utils/alerts';

interface Props { children: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };
  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }

  handleReset = async () => {
    try {
      await AsyncStorage.clear();
      showAlert('تم إعادة التعيين', 'سيتم إعادة تشغيل التطبيق. اضغط موافق.');
      // Reload the app (works in Expo)
      // @ts-ignore
      if (global?.Expo?.reloadApp) global.Expo.reloadApp();
      else window.location.reload();
    } catch (e) {
      this.setState({ hasError: false, error: null });
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 22, fontWeight: 'bold', color: 'red', marginBottom: 10 }}>⚠️ حدث خطأ</Text>
          <Text style={{ textAlign: 'center', marginBottom: 20 }}>عذراً، حدث خطأ غير متوقع. يمكنك محاولة إعادة تشغيل التطبيق.</Text>
          <TouchableOpacity onPress={this.handleReset} style={{ padding: 12, backgroundColor: '#1B6B4A', borderRadius: 8 }}>
            <Text style={{ color: 'white' }}>إعادة تشغيل التطبيق</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}
