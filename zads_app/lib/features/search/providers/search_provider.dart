import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/search_repository.dart';

// State for teacher search
class TeacherSearchState {
  final bool isLoading;
  final String? error;
  final List<dynamic> teachers;
  final int page;
  final int totalPages;
  final int total;

  TeacherSearchState({
    this.isLoading = false,
    this.error,
    this.teachers = const [],
    this.page = 1,
    this.totalPages = 1,
    this.total = 0,
  });

  TeacherSearchState copyWith({
    bool? isLoading,
    String? error,
    List<dynamic>? teachers,
    int? page,
    int? totalPages,
    int? total,
  }) {
    return TeacherSearchState(
      isLoading: isLoading ?? this.isLoading,
      error: error,
      teachers: teachers ?? this.teachers,
      page: page ?? this.page,
      totalPages: totalPages ?? this.totalPages,
      total: total ?? this.total,
    );
  }
}

final teacherSearchProvider =
    StateNotifierProvider<TeacherSearchNotifier, TeacherSearchState>((ref) {
      return TeacherSearchNotifier(ref.read(searchRepositoryProvider));
    });

class TeacherSearchNotifier extends StateNotifier<TeacherSearchState> {
  final SearchRepository _repository;

  TeacherSearchNotifier(this._repository) : super(TeacherSearchState());

  /// Search teachers
  Future<void> searchTeachers({
    String? areaId,
    String? cityId,
    String? governorateId,
    String? subjectId,
    String? stageId,
    String? lessonType,
    int page = 1,
    bool append = false,
  }) async {
    if (!append) {
      state = state.copyWith(isLoading: true, error: null);
    }

    try {
      final response = await _repository.searchTeachers(
        areaId: areaId,
        cityId: cityId,
        governorateId: governorateId,
        subjectId: subjectId,
        stageId: stageId,
        lessonType: lessonType,
        page: page,
      );

      final data = response['data'] ?? [];
      final pagination = response['pagination'] ?? {};

      state = state.copyWith(
        isLoading: false,
        teachers: append ? [...state.teachers, ...data] : data,
        page: pagination['page'] ?? page,
        totalPages: pagination['totalPages'] ?? 1,
        total: pagination['total'] ?? data.length,
      );
    } catch (e) {
      print('❌ Search Teachers Error: $e');
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  /// Load more teachers
  Future<void> loadMore({
    String? areaId,
    String? cityId,
    String? governorateId,
    String? subjectId,
    String? stageId,
  }) async {
    if (state.page >= state.totalPages || state.isLoading) return;

    await searchTeachers(
      areaId: areaId,
      cityId: cityId,
      governorateId: governorateId,
      subjectId: subjectId,
      stageId: stageId,
      page: state.page + 1,
      append: true,
    );
  }

  /// Reset search
  void reset() {
    state = TeacherSearchState();
  }
}
