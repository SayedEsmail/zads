import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/dio_client.dart';

final searchRepositoryProvider = Provider<SearchRepository>((ref) {
  return SearchRepository(ref.read(dioClientProvider).dio);
});

class SearchRepository {
  final Dio _dio;

  SearchRepository(this._dio);

  /// Search teachers with filters
  Future<Map<String, dynamic>> searchTeachers({
    String? areaId,
    String? cityId,
    String? governorateId,
    String? subjectId,
    String? stageId,
    String? lessonType,
    int? minPrice,
    int? maxPrice,
    int page = 1,
    int limit = 20,
  }) async {
    try {
      final queryParams = <String, dynamic>{'page': page, 'limit': limit};

      if (areaId != null) queryParams['areaId'] = areaId;
      if (cityId != null) queryParams['cityId'] = cityId;
      if (governorateId != null) queryParams['governorateId'] = governorateId;
      if (subjectId != null) queryParams['subjectId'] = subjectId;
      if (stageId != null) queryParams['stageId'] = stageId;
      if (lessonType != null) queryParams['lessonType'] = lessonType;
      if (minPrice != null) queryParams['minPrice'] = minPrice;
      if (maxPrice != null) queryParams['maxPrice'] = maxPrice;

      final response = await _dio.get(
        '/teachers/search',
        queryParameters: queryParams,
      );
      return response.data;
    } on DioException catch (e) {
      throw e.response?.data['message'] ?? 'فشل البحث';
    }
  }

  /// Get teacher by ID
  Future<Map<String, dynamic>> getTeacherById(String id) async {
    try {
      final response = await _dio.get('/teachers/$id');
      return response.data;
    } on DioException catch (e) {
      throw e.response?.data['message'] ?? 'فشل تحميل بيانات المعلم';
    }
  }
}
