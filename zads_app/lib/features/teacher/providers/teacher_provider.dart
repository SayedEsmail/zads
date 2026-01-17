import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/teacher_repository.dart';

// State for teacher profile
class TeacherProfileState {
  final bool isLoading;
  final String? error;
  final Map<String, dynamic>? profile;

  TeacherProfileState({this.isLoading = false, this.error, this.profile});

  TeacherProfileState copyWith({
    bool? isLoading,
    String? error,
    Map<String, dynamic>? profile,
  }) {
    return TeacherProfileState(
      isLoading: isLoading ?? this.isLoading,
      error: error,
      profile: profile ?? this.profile,
    );
  }
}

final teacherProfileProvider =
    StateNotifierProvider<TeacherProfileNotifier, TeacherProfileState>((ref) {
      return TeacherProfileNotifier(ref.read(teacherRepositoryProvider));
    });

class TeacherProfileNotifier extends StateNotifier<TeacherProfileState> {
  final TeacherRepository _repository;

  TeacherProfileNotifier(this._repository) : super(TeacherProfileState());

  /// Load teacher profile
  Future<void> loadProfile() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await _repository.getProfile();
      // API returns { data: { teacher: {...} } }
      final profile = response['data']?['teacher'] ?? response['data'];

      state = state.copyWith(isLoading: false, profile: profile);
    } catch (e) {
      print('❌ Load Profile Error: $e');
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  /// Update profile
  Future<bool> updateProfile({
    String? bio,
    int? experienceYears,
    String? qualification,
    String? areaId,
    List<String>? lessonTypes,
  }) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final response = await _repository.updateProfile(
        bio: bio,
        experienceYears: experienceYears,
        qualification: qualification,
        areaId: areaId,
        lessonTypes: lessonTypes,
      );

      final updatedProfile = response['data'];
      state = state.copyWith(isLoading: false, profile: updatedProfile);

      return true;
    } catch (e) {
      print('❌ Update Profile Error: $e');
      state = state.copyWith(isLoading: false, error: e.toString());
      return false;
    }
  }
}

// Provider for subjects list
final subjectsProvider = FutureProvider<List<dynamic>>((ref) async {
  final repository = ref.read(teacherRepositoryProvider);
  return await repository.getSubjects();
});

// Provider for stages list
final stagesProvider = FutureProvider<List<dynamic>>((ref) async {
  final repository = ref.read(teacherRepositoryProvider);
  return await repository.getStages();
});

// State for teacher subjects
class TeacherSubjectsState {
  final bool isLoading;
  final String? error;
  final List<dynamic> subjects;

  TeacherSubjectsState({
    this.isLoading = false,
    this.error,
    this.subjects = const [],
  });

  TeacherSubjectsState copyWith({
    bool? isLoading,
    String? error,
    List<dynamic>? subjects,
  }) {
    return TeacherSubjectsState(
      isLoading: isLoading ?? this.isLoading,
      error: error,
      subjects: subjects ?? this.subjects,
    );
  }
}

final teacherSubjectsProvider =
    StateNotifierProvider<TeacherSubjectsNotifier, TeacherSubjectsState>((ref) {
      return TeacherSubjectsNotifier(ref.read(teacherRepositoryProvider));
    });

class TeacherSubjectsNotifier extends StateNotifier<TeacherSubjectsState> {
  final TeacherRepository _repository;

  TeacherSubjectsNotifier(this._repository) : super(TeacherSubjectsState());

  /// Load teacher subjects
  Future<void> loadSubjects() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final subjects = await _repository.getTeacherSubjects();
      state = state.copyWith(isLoading: false, subjects: subjects);
    } catch (e) {
      print('❌ Load Subjects Error: $e');
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  /// Add subject
  Future<bool> addSubject({
    required String subjectId,
    required String stageId,
    int? priceAtTeacher,
    int? priceAtStudent,
    int? priceGroup,
    int? durationMinutes,
  }) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      await _repository.addSubject(
        subjectId: subjectId,
        stageId: stageId,
        priceAtTeacher: priceAtTeacher,
        priceAtStudent: priceAtStudent,
        priceGroup: priceGroup,
        durationMinutes: durationMinutes,
      );

      // Reload subjects
      await loadSubjects();
      return true;
    } catch (e) {
      print('❌ Add Subject Error: $e');
      state = state.copyWith(isLoading: false, error: e.toString());
      return false;
    }
  }

  /// Update subject pricing
  Future<bool> updateSubject({
    required String teacherSubjectId,
    int? priceAtTeacher,
    int? priceAtStudent,
    int? priceGroup,
    int? durationMinutes,
  }) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      await _repository.updateSubject(
        teacherSubjectId: teacherSubjectId,
        priceAtTeacher: priceAtTeacher,
        priceAtStudent: priceAtStudent,
        priceGroup: priceGroup,
        durationMinutes: durationMinutes,
      );

      // Reload subjects
      await loadSubjects();
      return true;
    } catch (e) {
      print('❌ Update Subject Error: $e');
      state = state.copyWith(isLoading: false, error: e.toString());
      return false;
    }
  }

  /// Delete subject
  Future<bool> deleteSubject(String teacherSubjectId) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      await _repository.deleteSubject(teacherSubjectId);

      // Reload subjects
      await loadSubjects();
      return true;
    } catch (e) {
      print('❌ Delete Subject Error: $e');
      state = state.copyWith(isLoading: false, error: e.toString());
      return false;
    }
  }
}

// State for open tutor requests (jobs)
class TeacherTutorRequestsState {
  final bool isLoading;
  final String? error;
  final List<dynamic> requests;

  TeacherTutorRequestsState({
    this.isLoading = false,
    this.error,
    this.requests = const [],
  });

  TeacherTutorRequestsState copyWith({
    bool? isLoading,
    String? error,
    List<dynamic>? requests,
  }) {
    return TeacherTutorRequestsState(
      isLoading: isLoading ?? this.isLoading,
      error: error,
      requests: requests ?? this.requests,
    );
  }
}

final teacherTutorRequestsProvider =
    StateNotifierProvider<
      TeacherTutorRequestsNotifier,
      TeacherTutorRequestsState
    >((ref) {
      return TeacherTutorRequestsNotifier(ref.read(teacherRepositoryProvider));
    });

class TeacherTutorRequestsNotifier
    extends StateNotifier<TeacherTutorRequestsState> {
  final TeacherRepository _repository;

  TeacherTutorRequestsNotifier(this._repository)
    : super(TeacherTutorRequestsState());

  /// Load open requests
  Future<void> loadRequests({
    String? subjectId,
    String? stageId,
    double? latitude,
    double? longitude,
  }) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final requests = await _repository.getTutorRequests(
        subjectId: subjectId,
        stageId: stageId,
        latitude: latitude,
        longitude: longitude,
      );
      state = state.copyWith(isLoading: false, requests: requests);
    } catch (e) {
      print('❌ Load Open Requests Error: $e');
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }
}
