/**
 * Enhanced Error Boundary with Exponential Backoff Retry
 *
 * Features:
 * - Automatic retry with exponential backoff
 * - Failed attempt tracking
 * - User-friendly error messages
 * - Inheritance-specific error handling
 * - Comprehensive error logging
 *
 * Retry Strategy:
 * - Initial wait: 500ms
 * - Max retries: 3
 * - Backoff multiplier: 2x (500ms, 1s, 2s)
 */

import React, { Component, ReactNode } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { showAlert } from '../utils/alerts';
import { isInheritanceCalculationError, getUserFriendlyError } from '../engine/errors';
import { lightTheme } from '../constants/theme';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  maxRetries?: number;
  initialRetryDelay?: number;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  retryCount: number;
  isRetrying: boolean;
  retryMessage: string;
}

const colors = lightTheme.colors;

export class EnhancedErrorBoundary extends Component<Props, State> {
  retryTimeoutId: NodeJS.Timeout | null = null;
  maxRetries: number;
  initialRetryDelay: number;

  constructor(props: Props) {
    super(props);
    this.maxRetries = props.maxRetries ?? 3;
    this.initialRetryDelay = props.initialRetryDelay ?? 500;

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      isRetrying: false,
      retryMessage: '',
    };
  }

  static getDerivedStateFromError(error: Error) {
    return {
      hasError: true,
      error,
      errorInfo: null,
      isRetrying: false,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });

    console.error('[EnhancedErrorBoundary]', error.message, error.stack);
    console.error('[EnhancedErrorBoundary] Component Stack:', errorInfo.componentStack);

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    this.logErrorToStorage(error, errorInfo);

    // Automatically retry if we haven't exceeded max retries
    if (this.state.retryCount < this.maxRetries) {
      this.scheduleRetry();
    }
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  private async logErrorToStorage(error: Error, errorInfo: React.ErrorInfo) {
    try {
      const errorLog = {
        timestamp: new Date().toISOString(),
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        isInheritanceError: isInheritanceCalculationError(error),
        retryAttempt: this.state.retryCount,
      };

      const existingLogs = await AsyncStorage.getItem('error_logs');
      const logs = existingLogs ? JSON.parse(existingLogs) : [];
      logs.unshift(errorLog);

      // Keep only last 20 errors
      if (logs.length > 20) logs.pop();

      await AsyncStorage.setItem('error_logs', JSON.stringify(logs));
    } catch (e) {
      console.error('Failed to log error to storage:', e);
    }
  }

  private scheduleRetry = () => {
    const delay = this.initialRetryDelay * Math.pow(2, this.state.retryCount);
    const retryCount = this.state.retryCount + 1;

    this.setState({
      isRetrying: true,
      retryCount,
      retryMessage: `Retrying... (${retryCount}/${this.maxRetries}) in ${Math.round(delay / 1000)}s`,
    });

    this.retryTimeoutId = setTimeout(() => {
      this.handleRetry();
    }, delay);
  };

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      isRetrying: false,
      retryMessage: '',
    });
  };

  handleManualRetry = () => {
    this.setState({
      retryCount: 0,
      isRetrying: false,
      retryMessage: '',
    });
    this.handleRetry();
  };

  getUserMessage(): string {
    if (!this.state.error) return 'Unknown error';

    if (isInheritanceCalculationError(this.state.error)) {
      return getUserFriendlyError(this.state.error);
    }

    return this.state.error.message || 'An unknown error occurred';
  }

  handleReset = async () => {
    try {
      await AsyncStorage.clear();
      showAlert('تم إعادة التعيين', 'سيتم إعادة تشغيل التطبيق. اضغط موافق.');
      // @ts-ignore
      if (global?.Expo?.reloadApp) global.Expo.reloadApp();
      else if (typeof window !== 'undefined') window.location.reload();
      else this.setState({ hasError: false, error: null, errorInfo: null });
    } catch (e) {
      console.error('Reset failed:', e);
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: 0,
        isRetrying: false,
      });
    }
  };

  handleDismiss = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      isRetrying: false,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={{ flex: 1, backgroundColor: colors.errorLight, padding: 20 }}>
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
            <View style={{ alignItems: 'center', padding: 20 }}>
              <Text style={{ fontSize: 48, marginBottom: 16 }}>
                {this.state.isRetrying ? '⏳' : '⚠️'}
              </Text>

              {this.state.isRetrying ? (
                <>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: 'bold',
                      marginBottom: 8,
                      color: colors.text.primary,
                    }}
                  >
                    Attempting Recovery...
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: colors.text.secondary,
                      marginBottom: 16,
                      textAlign: 'center',
                    }}
                  >
                    {this.state.retryMessage}
                  </Text>
                </>
              ) : (
                <>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: 'bold',
                      marginBottom: 8,
                      color: colors.error,
                    }}
                  >
                    Something Went Wrong
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: colors.text.secondary,
                      marginBottom: 16,
                      textAlign: 'center',
                    }}
                  >
                    {this.getUserMessage()}
                  </Text>

                  {__DEV__ && this.state.errorInfo && (
                    <View
                      style={{
                        marginVertical: 12,
                        paddingVertical: 12,
                        borderTopWidth: 1,
                        borderTopColor: colors.outline,
                        width: '100%',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          color: colors.text.secondary,
                          fontFamily: 'monospace',
                        }}
                      >
                        Stack: {this.state.error?.message}
                      </Text>
                    </View>
                  )}

                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 20, width: '100%' }}>
                    <TouchableOpacity
                      onPress={this.handleManualRetry}
                      style={{
                        flex: 1,
                        paddingVertical: 12,
                        paddingHorizontal: 16,
                        backgroundColor: colors.primary,
                        borderRadius: 8,
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{ color: colors.onPrimary, fontWeight: 'bold', fontSize: 14 }}>
                        Retry
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={this.handleReset}
                      style={{
                        flex: 1,
                        paddingVertical: 12,
                        paddingHorizontal: 16,
                        backgroundColor: colors.error,
                        borderRadius: 8,
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 14 }}>
                        Reset
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={this.handleDismiss}
                      style={{
                        flex: 1,
                        paddingVertical: 12,
                        paddingHorizontal: 16,
                        backgroundColor: colors.outline,
                        borderRadius: 8,
                        alignItems: 'center',
                      }}
                    >
                      <Text
                        style={{ color: colors.text.primary, fontWeight: 'bold', fontSize: 14 }}
                      >
                        Dismiss
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}
