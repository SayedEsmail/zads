import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/dio_client.dart';

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepository(ref.read(dioClientProvider).dio);
});

class AuthRepository {
  final Dio _dio;

  AuthRepository(this._dio);

  Future<Map<String, dynamic>> login(String phone, String password) async {
    try {
      final response = await _dio.post(
        '/auth/login',
        data: {'phone': phone, 'password': password},
      );
      return response.data;
    } on DioException catch (e) {
      throw e.response?.data['message'] ?? 'فشل تسجيل الدخول';
    }
  }

  Future<Map<String, dynamic>> registerTeacher(
    String name,
    String phone,
    String password,
  ) async {
    try {
      final response = await _dio.post(
        '/auth/register/teacher',
        data: {'name': name, 'phone': phone, 'password': password},
      );
      return response.data;
    } on DioException catch (e) {
      throw e.response?.data['message'] ?? 'فشل التسجيل';
    }
  }

  Future<Map<String, dynamic>> registerParent(
    String name,
    String phone,
    String password,
  ) async {
    try {
      final response = await _dio.post(
        '/auth/register/parent',
        data: {'name': name, 'phone': phone, 'password': password},
      );
      return response.data;
    } on DioException catch (e) {
      throw e.response?.data['message'] ?? 'فشل التسجيل';
    }
  }
}
