import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../data/auth_repository.dart';

// State to hold current user info
class AuthState {
  final bool isLoading;
  final String? error;
  final Map<String, dynamic>? user;
  final bool isAuthenticated;
  final String? userType; // 'teacher' or 'parent'

  AuthState({
    this.isLoading = false,
    this.error,
    this.user,
    this.isAuthenticated = false,
    this.userType,
  });

  AuthState copyWith({
    bool? isLoading,
    String? error,
    Map<String, dynamic>? user,
    bool? isAuthenticated,
    String? userType,
  }) {
    return AuthState(
      isLoading: isLoading ?? this.isLoading,
      error: error,
      user: user ?? this.user,
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      userType: userType ?? this.userType,
    );
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(ref.read(authRepositoryProvider));
});

class AuthNotifier extends StateNotifier<AuthState> {
  final AuthRepository _repository;

  AuthNotifier(this._repository) : super(AuthState());

  Future<void> login(String phone, String password) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await _repository.login(phone, password);

      // Debug: Print the entire response
      print('📥 Login Response: $response');
      print('📥 Response type: ${response.runtimeType}');
      print('📥 Has data key: ${response.containsKey('data')}');

      // Ensure data exists
      if (response['data'] == null) {
        throw 'Invalid response from server';
      }

      final data = response['data'];
      print('📦 Data: $data');

      final token = data['token'];
      print('🔑 Token: $token (type: ${token.runtimeType})');

      final user = data['user'];
      print('👤 User: $user');

      if (token == null) {
        throw 'Token not found in response';
      }

      // Save token and user info safely
      final prefs = await SharedPreferences.getInstance();
      print('💾 About to save token: ${token.toString()}');
      await prefs.setString('token', token.toString());

      final userType = user?['userType']?.toString() ?? 'parent';
      print('💾 About to save userType: $userType');
      await prefs.setString('userType', userType);

      state = state.copyWith(
        isLoading: false,
        isAuthenticated: true,
        user: user,
        userType: userType,
      );

      print('✅ Login successful!');
    } catch (e, stackTrace) {
      print('❌ Login Error: $e');
      print('Stack trace: $stackTrace');
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> registerTeacher({
    required String name,
    required String phone,
    required String password,
  }) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await _repository.registerTeacher(name, phone, password);
      if (response['data'] == null) throw 'Invalid response';

      final data = response['data'];
      final token = data['token'];

      if (token == null) throw 'Token missing';

      // Save token
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('token', token.toString());
      await prefs.setString('userType', 'teacher');

      state = state.copyWith(
        isLoading: false,
        isAuthenticated: true,
        user: data['user'],
        userType: 'teacher',
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> registerParent({
    required String name,
    required String phone,
    required String password,
  }) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await _repository.registerParent(name, phone, password);
      if (response['data'] == null) throw 'Invalid response';

      final data = response['data'];
      final token = data['token'];

      if (token == null) throw 'Token missing';

      // Save token
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('token', token.toString());
      await prefs.setString('userType', 'parent');

      state = state.copyWith(
        isLoading: false,
        isAuthenticated: true,
        user: data['user'],
        userType: 'parent',
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    await prefs.remove('userType');
    state = AuthState();
  }

  Future<void> checkAuth() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');
    final userType = prefs.getString('userType');

    if (token != null) {
      state = state.copyWith(isAuthenticated: true, userType: userType);
    }
  }
}
