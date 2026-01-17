import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../providers/teacher_provider.dart';
import '../../locations/providers/locations_provider.dart';

class TeacherProfileEditScreen extends ConsumerStatefulWidget {
  const TeacherProfileEditScreen({super.key});

  @override
  ConsumerState<TeacherProfileEditScreen> createState() =>
      _TeacherProfileEditScreenState();
}

class _TeacherProfileEditScreenState
    extends ConsumerState<TeacherProfileEditScreen> {
  final _formKey = GlobalKey<FormState>();
  final _bioController = TextEditingController();
  final _experienceController = TextEditingController();
  final _qualificationController = TextEditingController();

  bool _lessonAtTeacher = true;
  bool _lessonAtStudent = true;
  bool _lessonGroup = false;

  String? _selectedGovernorateId;
  String? _selectedCityId;
  String? _selectedAreaId;

  @override
  void initState() {
    super.initState();
    Future.microtask(
      () => ref.read(teacherProfileProvider.notifier).loadProfile(),
    );
  }

  @override
  void dispose() {
    _bioController.dispose();
    _experienceController.dispose();
    _qualificationController.dispose();
    super.dispose();
  }

  void _initFromProfile(Map<String, dynamic>? profile) {
    if (profile == null) return;

    _bioController.text = profile['bio'] ?? '';
    _experienceController.text = profile['experienceYears']?.toString() ?? '';
    _qualificationController.text = profile['qualification'] ?? '';

    final lessonTypes = profile['lessonTypes'] as List<dynamic>? ?? [];
    _lessonAtTeacher = lessonTypes.contains('at_teacher');
    _lessonAtStudent = lessonTypes.contains('at_student');
    _lessonGroup = lessonTypes.contains('group');

    // Init location from profile
    final area = profile['area'];
    if (area != null) {
      _selectedAreaId = area['id'];
      final city = area['city'];
      if (city != null) {
        _selectedCityId = city['id'];
        final governorate = city['governorate'];
        if (governorate != null) {
          _selectedGovernorateId = governorate['id'];
        }
      }
    }
  }

  Future<void> _saveProfile() async {
    if (!_formKey.currentState!.validate()) return;

    final lessonTypes = <String>[];
    if (_lessonAtTeacher) lessonTypes.add('at_teacher');
    if (_lessonAtStudent) lessonTypes.add('at_student');
    if (_lessonGroup) lessonTypes.add('group');

    final success = await ref
        .read(teacherProfileProvider.notifier)
        .updateProfile(
          bio: _bioController.text.trim().isEmpty
              ? null
              : _bioController.text.trim(),
          experienceYears: int.tryParse(_experienceController.text.trim()),
          qualification: _qualificationController.text.trim().isEmpty
              ? null
              : _qualificationController.text.trim(),
          areaId: _selectedAreaId,
          lessonTypes: lessonTypes,
        );

    if (success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('تم حفظ البيانات بنجاح'),
          backgroundColor: AppColors.success,
        ),
      );
      context.pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    final profileState = ref.watch(teacherProfileProvider);
    final governoratesAsync = ref.watch(governoratesProvider);

    // Initialize form when profile loads
    ref.listen<TeacherProfileState>(teacherProfileProvider, (prev, next) {
      if (prev?.profile == null && next.profile != null) {
        setState(() => _initFromProfile(next.profile));
      }
    });

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
        title: const Text(
          'تعديل الملف الشخصي',
          style: TextStyle(
            fontFamily: 'Cairo',
            fontWeight: FontWeight.bold,
            color: Colors.black,
          ),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios, color: Colors.black),
          onPressed: () => context.pop(),
        ),
      ),
      body: profileState.isLoading
          ? const Center(
              child: CircularProgressIndicator(color: AppColors.primary),
            )
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Bio
                    _buildSectionTitle('السيرة الذاتية'),
                    TextFormField(
                      controller: _bioController,
                      maxLines: 4,
                      maxLength: 500,
                      decoration: _inputDecoration('اكتب نبذة عنك وخبراتك...'),
                    ),

                    const SizedBox(height: 16),

                    // Experience Years
                    _buildSectionTitle('سنوات الخبرة'),
                    TextFormField(
                      controller: _experienceController,
                      keyboardType: TextInputType.number,
                      decoration: _inputDecoration('مثال: 5'),
                      validator: (value) {
                        if (value != null && value.isNotEmpty) {
                          final years = int.tryParse(value);
                          if (years == null || years < 0 || years > 50) {
                            return 'أدخل عدد صحيح بين 0 و 50';
                          }
                        }
                        return null;
                      },
                    ),

                    const SizedBox(height: 16),

                    // Qualification
                    _buildSectionTitle('المؤهل العلمي'),
                    TextFormField(
                      controller: _qualificationController,
                      decoration: _inputDecoration('مثال: بكالوريوس تربية'),
                    ),

                    const SizedBox(height: 24),

                    // Location Section
                    _buildSectionTitle('الموقع'),
                    const Text(
                      'اختر موقعك لتسهيل وصول أولياء الأمور إليك',
                      style: TextStyle(
                        color: AppColors.textSecondary,
                        fontSize: 13,
                        fontFamily: 'Cairo',
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Governorate Dropdown
                    governoratesAsync.when(
                      data: (governorates) => _buildDropdown(
                        label: 'المحافظة',
                        value: _selectedGovernorateId,
                        items: governorates.map<DropdownMenuItem<String>>((g) {
                          return DropdownMenuItem(
                            value: g['id'] as String,
                            child: Text(g['nameAr'] ?? ''),
                          );
                        }).toList(),
                        onChanged: (value) {
                          setState(() {
                            _selectedGovernorateId = value;
                            _selectedCityId = null;
                            _selectedAreaId = null;
                          });
                        },
                      ),
                      loading: () => const LinearProgressIndicator(),
                      error: (e, _) => Text('خطأ: $e'),
                    ),

                    const SizedBox(height: 12),

                    // City Dropdown
                    if (_selectedGovernorateId != null)
                      Consumer(
                        builder: (context, ref, _) {
                          final citiesAsync = ref.watch(
                            citiesProvider(_selectedGovernorateId),
                          );
                          return citiesAsync.when(
                            data: (cities) => _buildDropdown(
                              label: 'المدينة',
                              value: _selectedCityId,
                              items: cities.map<DropdownMenuItem<String>>((c) {
                                return DropdownMenuItem(
                                  value: c['id'] as String,
                                  child: Text(c['nameAr'] ?? ''),
                                );
                              }).toList(),
                              onChanged: (value) {
                                setState(() {
                                  _selectedCityId = value;
                                  _selectedAreaId = null;
                                });
                              },
                            ),
                            loading: () => const LinearProgressIndicator(),
                            error: (e, _) => Text('خطأ: $e'),
                          );
                        },
                      ),

                    const SizedBox(height: 12),

                    // Area Dropdown
                    if (_selectedCityId != null)
                      Consumer(
                        builder: (context, ref, _) {
                          final areasAsync = ref.watch(
                            areasProvider(_selectedCityId),
                          );
                          return areasAsync.when(
                            data: (areas) => _buildDropdown(
                              label: 'الحي / المنطقة',
                              value: _selectedAreaId,
                              items: areas.map<DropdownMenuItem<String>>((a) {
                                return DropdownMenuItem(
                                  value: a['id'] as String,
                                  child: Text(a['nameAr'] ?? ''),
                                );
                              }).toList(),
                              onChanged: (value) {
                                setState(() {
                                  _selectedAreaId = value;
                                });
                              },
                            ),
                            loading: () => const LinearProgressIndicator(),
                            error: (e, _) => Text('خطأ: $e'),
                          );
                        },
                      ),

                    const SizedBox(height: 24),

                    // Lesson Types
                    _buildSectionTitle('أنواع الدروس'),
                    CheckboxListTile(
                      title: const Text(
                        'في بيت المعلم',
                        style: TextStyle(fontFamily: 'Cairo'),
                      ),
                      value: _lessonAtTeacher,
                      onChanged: (v) =>
                          setState(() => _lessonAtTeacher = v ?? false),
                      activeColor: AppColors.primary,
                      contentPadding: EdgeInsets.zero,
                    ),
                    CheckboxListTile(
                      title: const Text(
                        'في بيت الطالب',
                        style: TextStyle(fontFamily: 'Cairo'),
                      ),
                      value: _lessonAtStudent,
                      onChanged: (v) =>
                          setState(() => _lessonAtStudent = v ?? false),
                      activeColor: AppColors.primary,
                      contentPadding: EdgeInsets.zero,
                    ),
                    CheckboxListTile(
                      title: const Text(
                        'مجموعات',
                        style: TextStyle(fontFamily: 'Cairo'),
                      ),
                      value: _lessonGroup,
                      onChanged: (v) =>
                          setState(() => _lessonGroup = v ?? false),
                      activeColor: AppColors.primary,
                      contentPadding: EdgeInsets.zero,
                    ),

                    const SizedBox(height: 32),

                    // Save Button
                    SizedBox(
                      width: double.infinity,
                      height: 56,
                      child: ElevatedButton(
                        onPressed: profileState.isLoading ? null : _saveProfile,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primary,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                          ),
                        ),
                        child: profileState.isLoading
                            ? const CircularProgressIndicator(
                                color: Colors.white,
                              )
                            : const Text(
                                'حفظ التغييرات',
                                style: TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                  fontFamily: 'Cairo',
                                  color: Colors.white,
                                ),
                              ),
                      ),
                    ),

                    const SizedBox(height: 16),

                    // Error Message
                    if (profileState.error != null)
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppColors.error.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          profileState.error!,
                          style: const TextStyle(color: AppColors.error),
                        ),
                      ),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Text(
        title,
        style: const TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.bold,
          color: AppColors.textPrimary,
          fontFamily: 'Cairo',
        ),
      ),
    );
  }

  InputDecoration _inputDecoration(String hint) {
    return InputDecoration(
      hintText: hint,
      hintStyle: const TextStyle(
        color: AppColors.textSecondary,
        fontFamily: 'Cairo',
      ),
      filled: true,
      fillColor: Colors.white,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: BorderSide.none,
      ),
      contentPadding: const EdgeInsets.all(16),
    );
  }

  Widget _buildDropdown({
    required String label,
    required String? value,
    required List<DropdownMenuItem<String>> items,
    required void Function(String?) onChanged,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w500,
            color: AppColors.textPrimary,
            fontFamily: 'Cairo',
          ),
        ),
        const SizedBox(height: 4),
        Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
          ),
          child: DropdownButtonFormField<String>(
            initialValue: items.any((item) => item.value == value)
                ? value
                : null,
            items: items,
            onChanged: onChanged,
            decoration: InputDecoration(
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(16),
                borderSide: BorderSide.none,
              ),
              contentPadding: const EdgeInsets.symmetric(
                horizontal: 16,
                vertical: 12,
              ),
            ),
            hint: Text(
              'اختر $label',
              style: const TextStyle(fontFamily: 'Cairo'),
            ),
            isExpanded: true,
            style: const TextStyle(
              fontFamily: 'Cairo',
              color: AppColors.textPrimary,
              fontSize: 16,
            ),
          ),
        ),
      ],
    );
  }
}
