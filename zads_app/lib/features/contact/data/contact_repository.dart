import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/dio_client.dart';

final contactRepositoryProvider = Provider<ContactRepository>((ref) {
  return ContactRepository(ref.read(dioClientProvider).dio);
});

class ContactRepository {
  final Dio _dio;

  ContactRepository(this._dio);

  /// Create a contact request
  Future<Map<String, dynamic>> createContactRequest(String teacherId) async {
    try {
      final response = await _dio.post(
        '/contact-requests',
        data: {'teacherId': teacherId},
      );
      return response.data;
    } on DioException catch (e) {
      throw e.response?.data['message'] ?? 'فشل إرسال طلب التواصل';
    }
  }

  /// Get outgoing requests (for parents)
  Future<List<dynamic>> getOutgoingRequests() async {
    try {
      final response = await _dio.get('/contact-requests/outgoing');
      return response.data['data'] ?? [];
    } on DioException catch (e) {
      throw e.response?.data['message'] ?? 'فشل تحميل الطلبات المرسلة';
    }
  }

  /// Get incoming requests (for teachers)
  Future<List<dynamic>> getIncomingRequests() async {
    try {
      final response = await _dio.get('/contact-requests/incoming');
      return response.data['data'] ?? [];
    } on DioException catch (e) {
      throw e.response?.data['message'] ?? 'فشل تحميل الطلبات الواردة';
    }
  }
}
