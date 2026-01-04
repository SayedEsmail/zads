import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/dio_client.dart';

final locationsRepositoryProvider = Provider<LocationsRepository>((ref) {
  return LocationsRepository(ref.read(dioClientProvider).dio);
});

class LocationsRepository {
  final Dio _dio;

  LocationsRepository(this._dio);

  /// Get all governorates
  Future<List<dynamic>> getGovernorates() async {
    try {
      final response = await _dio.get('/locations/governorates');
      return response.data['data'] ?? [];
    } on DioException catch (e) {
      throw e.response?.data['message'] ?? 'فشل تحميل المحافظات';
    }
  }

  /// Get cities by governorate
  Future<List<dynamic>> getCitiesByGovernorate(String governorateId) async {
    try {
      final response = await _dio.get(
        '/locations/governorates/$governorateId/cities',
      );
      return response.data['data'] ?? [];
    } on DioException catch (e) {
      throw e.response?.data['message'] ?? 'فشل تحميل المدن';
    }
  }

  /// Get areas by city
  Future<List<dynamic>> getAreasByCity(String cityId) async {
    try {
      final response = await _dio.get('/locations/cities/$cityId/areas');
      return response.data['data'] ?? [];
    } on DioException catch (e) {
      throw e.response?.data['message'] ?? 'فشل تحميل الأحياء';
    }
  }

  /// Get full hierarchy (all governorates with cities and areas)
  Future<List<dynamic>> getFullHierarchy() async {
    try {
      final response = await _dio.get('/locations/hierarchy');
      return response.data['data'] ?? [];
    } on DioException catch (e) {
      throw e.response?.data['message'] ?? 'فشل تحميل المواقع';
    }
  }
}
