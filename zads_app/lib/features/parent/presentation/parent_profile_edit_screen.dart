import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../providers/parent_provider.dart';
import '../../locations/providers/locations_provider.dart';
import '../../teacher/providers/teacher_provider.dart';

class ParentProfileEditScreen extends ConsumerStatefulWidget {
  const ParentProfileEditScreen({super.key});

  @override
  ConsumerState<ParentProfileEditScreen> createState() =>
      _ParentProfileEditScreenState();
}

class _ParentProfileEditScreenState
    extends ConsumerState<ParentProfileEditScreen> {
  String? _selectedGovernorateId;
  String? _selectedCityId;
  String? _selectedAreaId;

  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      ref.read(parentProfileProvider.notifier).loadProfile();
      ref.read(parentChildrenProvider.notifier).loadChildren();
    });
  }

  void _initFromProfile(Map<String, dynamic>? profile) {
    if (profile == null) return;

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
    final success = await ref
        .read(parentProfileProvider.notifier)
        .updateProfile(areaId: _selectedAreaId);

    if (success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('تم حفظ البيانات بنجاح'),
          backgroundColor: AppColors.success,
        ),
      );
    }
  }

  void _showAddChildDialog() {
    final nameController = TextEditingController();
    String? selectedStageId;
    List<String> selectedSubjectIds = [];

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        height: MediaQuery.of(context).size.height * 0.8,
        decoration: const BoxDecoration(
          color: AppColors.background,
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: Column(
          children: [
            // Header
            Container(
              padding: const EdgeInsets.all(16),
              decoration: const BoxDecoration(
                color: AppColors.primary,
                borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
              ),
              child: Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.close, color: Colors.white),
                    onPressed: () => Navigator.pop(context),
                  ),
                  const Text(
                    'إضافة طفل',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                      fontFamily: 'Cairo',
                    ),
                  ),
                ],
              ),
            ),

            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: StatefulBuilder(
                  builder: (context, setDialogState) => Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Name
                      const Text(
                        'اسم الطفل',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontFamily: 'Cairo',
                        ),
                      ),
                      const SizedBox(height: 8),
                      TextField(
                        controller: nameController,
                        decoration: InputDecoration(
                          hintText: 'مثال: أحمد',
                          filled: true,
                          fillColor: Colors.white,
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide.none,
                          ),
                        ),
                      ),

                      const SizedBox(height: 16),

                      // Stage
                      const Text(
                        'المرحلة الدراسية',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontFamily: 'Cairo',
                        ),
                      ),
                      const SizedBox(height: 8),
                      Consumer(
                        builder: (context, ref, _) {
                          final stagesAsync = ref.watch(stagesProvider);
                          return stagesAsync.when(
                            data: (stages) => Wrap(
                              spacing: 8,
                              children: stages.map<Widget>((stage) {
                                final isSelected =
                                    selectedStageId == stage['id'];
                                return FilterChip(
                                  label: Text(stage['nameAr'] ?? ''),
                                  selected: isSelected,
                                  onSelected: (v) => setDialogState(() {
                                    selectedStageId = v ? stage['id'] : null;
                                  }),
                                  selectedColor: AppColors.primary.withOpacity(
                                    0.2,
                                  ),
                                  checkmarkColor: AppColors.primary,
                                );
                              }).toList(),
                            ),
                            loading: () => const CircularProgressIndicator(),
                            error: (e, _) => Text('خطأ: $e'),
                          );
                        },
                      ),

                      const SizedBox(height: 16),

                      // Subjects
                      const Text(
                        'المواد المطلوبة',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontFamily: 'Cairo',
                        ),
                      ),
                      const SizedBox(height: 8),
                      Consumer(
                        builder: (context, ref, _) {
                          final subjectsAsync = ref.watch(subjectsProvider);
                          return subjectsAsync.when(
                            data: (subjects) => Wrap(
                              spacing: 8,
                              runSpacing: 8,
                              children: subjects.map<Widget>((subject) {
                                final isSelected = selectedSubjectIds.contains(
                                  subject['id'],
                                );
                                return FilterChip(
                                  label: Text(subject['nameAr'] ?? ''),
                                  selected: isSelected,
                                  onSelected: (v) => setDialogState(() {
                                    if (v) {
                                      selectedSubjectIds.add(subject['id']);
                                    } else {
                                      selectedSubjectIds.remove(subject['id']);
                                    }
                                  }),
                                  selectedColor: AppColors.primary.withOpacity(
                                    0.2,
                                  ),
                                  checkmarkColor: AppColors.primary,
                                );
                              }).toList(),
                            ),
                            loading: () => const CircularProgressIndicator(),
                            error: (e, _) => Text('خطأ: $e'),
                          );
                        },
                      ),

                      const SizedBox(height: 24),

                      // Add Button
                      SizedBox(
                        width: double.infinity,
                        height: 50,
                        child: ElevatedButton(
                          onPressed: () async {
                            if (nameController.text.isEmpty ||
                                selectedStageId == null) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  content: Text('يرجى إدخال الاسم والمرحلة'),
                                ),
                              );
                              return;
                            }

                            final success = await ref
                                .read(parentChildrenProvider.notifier)
                                .addChild(
                                  name: nameController.text.trim(),
                                  stageId: selectedStageId!,
                                  subjectIds: selectedSubjectIds.isNotEmpty
                                      ? selectedSubjectIds
                                      : null,
                                );

                            if (success && mounted) {
                              Navigator.pop(context);
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  content: Text('تم إضافة الطفل'),
                                  backgroundColor: AppColors.success,
                                ),
                              );
                            }
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.primary,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          child: const Text(
                            'إضافة',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              fontFamily: 'Cairo',
                              color: Colors.white,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final profileState = ref.watch(parentProfileProvider);
    final childrenState = ref.watch(parentChildrenProvider);
    final governoratesAsync = ref.watch(governoratesProvider);

    // Initialize form when profile loads
    ref.listen<ParentProfileState>(parentProfileProvider, (prev, next) {
      if (prev?.profile == null && next.profile != null) {
        setState(() => _initFromProfile(next.profile));
      }
    });

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.primary,
        title: const Text(
          'ملف ولي الأمر',
          style: TextStyle(
            fontFamily: 'Cairo',
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios, color: Colors.white),
          onPressed: () => context.pop(),
        ),
      ),
      body: profileState.isLoading
          ? const Center(
              child: CircularProgressIndicator(color: AppColors.primary),
            )
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Location Section
                  _buildSectionTitle('الموقع'),
                  const Text(
                    'اختر موقعك للبحث عن المعلمين القريبين',
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

                  const SizedBox(height: 16),

                  // Save Location Button
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: profileState.isLoading ? null : _saveProfile,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: const Text(
                        'حفظ الموقع',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          fontFamily: 'Cairo',
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),

                  const SizedBox(height: 32),

                  // Children Section
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      _buildSectionTitle('الأبناء'),
                      TextButton.icon(
                        onPressed: _showAddChildDialog,
                        icon: const Icon(Icons.add, color: AppColors.primary),
                        label: const Text(
                          'إضافة',
                          style: TextStyle(
                            color: AppColors.primary,
                            fontFamily: 'Cairo',
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const Text(
                    'أضف أبناءك والمواد المطلوبة للبحث عن المعلمين المناسبين',
                    style: TextStyle(
                      color: AppColors.textSecondary,
                      fontSize: 13,
                      fontFamily: 'Cairo',
                    ),
                  ),
                  const SizedBox(height: 12),

                  // Children List
                  if (childrenState.isLoading)
                    const Center(child: CircularProgressIndicator())
                  else if (childrenState.children.isEmpty)
                    Container(
                      padding: const EdgeInsets.all(32),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Center(
                        child: Column(
                          children: [
                            Icon(
                              Icons.child_care,
                              size: 48,
                              color: AppColors.textSecondary,
                            ),
                            SizedBox(height: 8),
                            Text(
                              'لم تضف أي أبناء بعد',
                              style: TextStyle(
                                color: AppColors.textSecondary,
                                fontFamily: 'Cairo',
                              ),
                            ),
                          ],
                        ),
                      ),
                    )
                  else
                    ...childrenState.children.map(
                      (child) => _buildChildCard(child),
                    ),
                ],
              ),
            ),
    );
  }

  Widget _buildChildCard(Map<String, dynamic> child) {
    final subjects = (child['subjects'] as List? ?? [])
        .map((s) => s['subject']?['nameAr'] ?? '')
        .where((s) => s.isNotEmpty)
        .join('، ');

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Icon(Icons.person, color: AppColors.primary),
                  const SizedBox(width: 8),
                  Text(
                    child['name'] ?? '',
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      fontFamily: 'Cairo',
                    ),
                  ),
                ],
              ),
              IconButton(
                icon: const Icon(Icons.delete_outline, color: AppColors.error),
                onPressed: () async {
                  final confirm = await showDialog<bool>(
                    context: context,
                    builder: (context) => AlertDialog(
                      title: const Text(
                        'حذف الطفل',
                        style: TextStyle(fontFamily: 'Cairo'),
                      ),
                      content: const Text(
                        'هل أنت متأكد من حذف هذا الطفل؟',
                        style: TextStyle(fontFamily: 'Cairo'),
                      ),
                      actions: [
                        TextButton(
                          onPressed: () => Navigator.pop(context, false),
                          child: const Text('إلغاء'),
                        ),
                        TextButton(
                          onPressed: () => Navigator.pop(context, true),
                          child: const Text(
                            'حذف',
                            style: TextStyle(color: AppColors.error),
                          ),
                        ),
                      ],
                    ),
                  );

                  if (confirm == true) {
                    await ref
                        .read(parentChildrenProvider.notifier)
                        .deleteChild(child['id']);
                  }
                },
              ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.primary.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  child['stage']?['nameAr'] ?? '',
                  style: const TextStyle(
                    color: AppColors.primary,
                    fontSize: 12,
                    fontFamily: 'Cairo',
                  ),
                ),
              ),
            ],
          ),
          if (subjects.isNotEmpty) ...[
            const SizedBox(height: 8),
            Text(
              'المواد: $subjects',
              style: const TextStyle(
                color: AppColors.textSecondary,
                fontSize: 13,
                fontFamily: 'Cairo',
              ),
            ),
          ],
        ],
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
            borderRadius: BorderRadius.circular(12),
          ),
          child: DropdownButtonFormField<String>(
            initialValue: items.any((item) => item.value == value) ? value : null,
            items: items,
            onChanged: onChanged,
            decoration: InputDecoration(
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
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
