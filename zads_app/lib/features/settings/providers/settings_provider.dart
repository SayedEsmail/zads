import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

class SettingsState {
  final bool notificationsEnabled;
  final String languageCode;
  final bool isLoading;

  SettingsState({
    this.notificationsEnabled = true,
    this.languageCode = 'ar',
    this.isLoading = true,
  });

  SettingsState copyWith({
    bool? notificationsEnabled,
    String? languageCode,
    bool? isLoading,
  }) {
    return SettingsState(
      notificationsEnabled: notificationsEnabled ?? this.notificationsEnabled,
      languageCode: languageCode ?? this.languageCode,
      isLoading: isLoading ?? this.isLoading,
    );
  }
}

final settingsProvider = StateNotifierProvider<SettingsNotifier, SettingsState>(
  (ref) {
    return SettingsNotifier();
  },
);

class SettingsNotifier extends StateNotifier<SettingsState> {
  SettingsNotifier() : super(SettingsState()) {
    _loadSettings();
  }

  Future<void> _loadSettings() async {
    final prefs = await SharedPreferences.getInstance();
    final notificationsEnabled = prefs.getBool('notifications_enabled') ?? true;
    final languageCode = prefs.getString('language_code') ?? 'ar';

    state = state.copyWith(
      notificationsEnabled: notificationsEnabled,
      languageCode: languageCode,
      isLoading: false,
    );
  }

  Future<void> toggleNotifications(bool value) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('notifications_enabled', value);
    state = state.copyWith(notificationsEnabled: value);
  }

  Future<void> setLanguage(String code) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('language_code', code);
    state = state.copyWith(languageCode: code);
  }
}
