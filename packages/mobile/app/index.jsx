import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../common/auth/authContext';
import { colors, fonts, shadow } from '../common/theme';

export default function LoginScreen() {
  const { session, login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const submitting = useRef(false);

  async function handleLogin() {
    if (submitting.current) {
      return;
    }

    setError('');

    if (!email.trim() || !password) {
      setError('Ingresá tu correo y contraseña.');
      return;
    }

    submitting.current = true;
    setIsLoading(true);

    try {
      await login(email.trim(), password);
      setPassword('');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No se pudo iniciar sesión.'
      );
    } finally {
      submitting.current = false;
      setIsLoading(false);
    }
  }

  if (session?.role === 'player') {
    return <Redirect href="/home" />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.form}>
          <View
            style={styles.logo}
            accessible={false}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          >
            <View style={styles.logoCircle} />
            <View style={styles.logoHorizontal} />
            <View style={styles.logoVertical} />
            <View style={styles.logoCenter} />
          </View>

          <Text style={styles.title}>{'Batalla\nNaval'}</Text>

          <Text style={styles.subtitle}>
            Ingresá para ver tus torneos y partidas.
          </Text>

          <Text style={styles.label}>Correo electrónico</Text>

          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="nombre@correo.com"
            placeholderTextColor={colors.muted}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            accessibilityLabel="Correo electrónico"
            editable={!isLoading}
          />

          <Text style={styles.label}>Contraseña</Text>

          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor={colors.muted}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="current-password"
            accessibilityLabel="Contraseña"
            editable={!isLoading}
            returnKeyType="go"
            onSubmitEditing={handleLogin}
          />

          {error ? (
            <Text
              style={styles.error}
              accessibilityRole="alert"
              accessibilityLiveRegion="polite"
            >
              {error}
            </Text>
          ) : null}

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Ingresar"
            accessibilityState={{
              disabled: isLoading,
              busy: isLoading,
            }}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.onBrand} />
            ) : (
              <Text style={styles.buttonText}>Ingresar</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },

  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 40,
  },

  form: {
    width: '100%',
    maxWidth: 360,
  },

  logo: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },

  logoCircle: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.ink,
  },

  logoHorizontal: {
    position: 'absolute',
    width: 40,
    height: 1.5,
    backgroundColor: colors.brand,
  },

  logoVertical: {
    position: 'absolute',
    width: 1.5,
    height: 40,
    backgroundColor: colors.brand,
  },

  logoCenter: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.ink,
    backgroundColor: '#ffffff',
  },

  title: {
    fontSize: 18,
    fontFamily: fonts.title,
    lineHeight: 28,
    color: colors.text,
    textAlign: 'left',
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 15,
    fontFamily: fonts.body,
    lineHeight: 22,
    color: colors.muted,
    textAlign: 'left',
    marginBottom: 30,
  },

  label: {
    fontSize: 15,
    fontFamily: fonts.body,
    color: colors.text,
    marginBottom: 6,
  },

  input: {
    minHeight: 44,
    borderWidth: 3,
    borderColor: colors.ink,
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 17,
    fontFamily: fonts.body,
    color: colors.text,
    marginBottom: 16,
  },

  error: {
    fontSize: 14,
    fontFamily: fonts.body,
    lineHeight: 20,
    color: colors.error,
    marginBottom: 18,
  },

  button: {
    minHeight: 48,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 4,
    marginBottom: 6,
    borderWidth: 3,
    borderColor: colors.ink,
    boxShadow: shadow.md,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: '#ffffff',
    fontSize: 17,
    fontFamily: fonts.semibold,
  },
});
