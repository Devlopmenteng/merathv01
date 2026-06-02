import React, { Component, ReactNode } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { showAlert } from './lib/utils/alerts';
import { isInheritanceCalculationError, getUserFriendlyError } from './lib/engine/errors';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null, errorInfo: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });

    // Log error details
    console.error('[ErrorBoundary]', error.message, error.stack);
    console.error('[ErrorBoundary] Component Stack:', errorInfo.componentStack);

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Store error for debugging
    this.logErrorToStorage(error, errorInfo);
  }

  private async logErrorToStorage(error: Error, errorInfo: React.ErrorInfo) {
    try {
      const errorLog = {
        timestamp: new Date().toISOString(),
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        isInheritanceError: isInheritanceCalculationError(error),
      };

      const existingLogs = await AsyncStorage.getItem('error_logs');
      const logs = existingLogs ? JSON.parse(existingLogs) : [];
      logs.unshift(errorLog);

      // Keep only last 10 errors
      if (logs.length > 10) logs.pop();

      await AsyncStorage.setItem('error_logs', JSON.stringify(logs));
    } catch (e) {
      console.error('Failed to log error to storage:', e);
    }
  }

  getUserMessage(): string {
    if (isInheritanceCalculationError(this.state.error)) {
      return getUserFriendlyError(this.state.error);
    }
    return this.state.error?.message || 'An unknown error occurred';
  }

  handleReset = async () => {
    try {
      await AsyncStorage.clear();
      showAlert('تم إعادة التعيين', 'سيتم إعادة تشغيل التطبيق. اضغط موافق.');
      // Reload the app (works in Expo)
      // @ts-ignore
      if (global?.Expo?.reloadApp) global.Expo.reloadApp();
      else if (typeof window !== 'undefined') window.location.reload();
      else this.setState({ hasError: false, error: null, errorInfo: null });
    } catch (e) {
      console.error('Reset failed:', e);
      this.setState({ hasError: false, error: null, errorInfo: null });
    }
  };

  handleDismiss = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={{ flex: 1, backgroundColor: '#FFF5F5', padding: 20 }}>
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
            <View style={{ alignItems: 'center', padding: 20 }}>
              <Text style={{ fontSize: 48, marginBottom: 16 }}>⚠️</Text>
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: 'bold',
                  color: '#C53030',
                  marginBottom: 12,
                  textAlign: 'center',
                }}
              >
                حدث خطأ
              </Text>
              <Text
                style={{ textAlign: 'center', marginBottom: 20, color: '#4A5568', lineHeight: 24 }}
              >
                {this.getUserMessage()}
              </Text>

              {__DEV__ && this.state.error && (
                <View
                  style={{
                    backgroundColor: '#EDF2F7',
                    padding: 12,
                    borderRadius: 8,
                    marginBottom: 20,
                    width: '100%',
                  }}
                >
                  <Text
                    style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 8, color: '#2D3748' }}
                  >
                    Error Details (Development Mode):
                  </Text>
                  <Text style={{ fontSize: 11, color: '#4A5568', fontFamily: 'monospace' }}>
                    {this.state.error.message}
                  </Text>
                  {this.state.error.stack && (
                    <Text
                      style={{
                        fontSize: 10,
                        color: '#718096',
                        marginTop: 8,
                        fontFamily: 'monospace',
                      }}
                    >
                      {this.state.error.stack.substring(0, 500)}
                    </Text>
                  )}
                </View>
              )}

              <View style={{ width: '100%', gap: 12 }}>
                <TouchableOpacity
                  onPress={this.handleReset}
                  style={{
                    padding: 14,
                    backgroundColor: '#1B6B4A',
                    borderRadius: 8,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>
                    إعادة تشغيل التطبيق
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={this.handleDismiss}
                  style={{
                    padding: 14,
                    backgroundColor: 'transparent',
                    borderRadius: 8,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: '#1B6B4A',
                  }}
                >
                  <Text style={{ color: '#1B6B4A', fontWeight: '600', fontSize: 16 }}>
                    تجاهل والمتابعة
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      );
    }
    return this.props.children;
  }
}
