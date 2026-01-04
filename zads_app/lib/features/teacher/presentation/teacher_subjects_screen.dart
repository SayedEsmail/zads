import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../providers/teacher_provider.dart';

class TeacherSubjectsScreen extends ConsumerStatefulWidget {
  const TeacherSubjectsScreen({super.key});

  @override
  ConsumerState<TeacherSubjectsScreen> createState() =>
      _TeacherSubjectsScreenState();
}

class _TeacherSubjectsScreenState extends ConsumerState<TeacherSubjectsScreen> {
  @override
  void initState() {
    super.initState();
    // Load teacher's subjects when screen opens
    Future.microtask(
      () => ref.read(teacherSubjectsProvider.notifier).loadSubjects(),
    );
  }

  void _showAddSubjectDialog() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => const AddSubjectBottomSheet(),
    );
  }

  @override
  Widget build(BuildContext context) {
    final subjectsState = ref.watch(teacherSubjectsProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.primary,
        title: const Text(
          'المواد الدراسية',
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
      body: subjectsState.isLoading
          ? const Center(
              child: CircularProgressIndicator(color: AppColors.primary),
            )
          : subjectsState.subjects.isEmpty
          ? _buildEmptyState()
          : _buildSubjectsList(subjectsState.subjects),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _showAddSubjectDialog,
        backgroundColor: AppColors.primary,
        icon: const Icon(Icons.add, color: Colors.white),
        label: const Text(
          'إضافة مواد',
          style: TextStyle(
            fontFamily: 'Cairo',
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.menu_book_outlined,
            size: 80,
            color: AppColors.textSecondary.withOpacity(0.5),
          ),
          const SizedBox(height: 16),
          const Text(
            'لم تضف أي مواد بعد',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: AppColors.textSecondary,
              fontFamily: 'Cairo',
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'أضف المواد التي تدرسها والمراحل الدراسية',
            style: TextStyle(
              fontSize: 14,
              color: AppColors.textSecondary,
              fontFamily: 'Cairo',
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSubjectsList(List<dynamic> subjects) {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: subjects.length,
      itemBuilder: (context, index) {
        final item = subjects[index];
        final subject = item['subject'];
        final stage = item['stage'];

        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          child: ListTile(
            contentPadding: const EdgeInsets.all(16),
            leading: CircleAvatar(
              backgroundColor: AppColors.primary.withOpacity(0.1),
              child: const Icon(Icons.book, color: AppColors.primary),
            ),
            title: Text(
              subject['nameAr'] ?? subject['name'] ?? 'مادة',
              style: const TextStyle(
                fontWeight: FontWeight.bold,
                fontFamily: 'Cairo',
              ),
            ),
            subtitle: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 4),
                Text(
                  stage['nameAr'] ?? stage['name'] ?? 'مرحلة',
                  style: const TextStyle(
                    color: AppColors.textSecondary,
                    fontFamily: 'Cairo',
                  ),
                ),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  children: [
                    if (item['priceAtTeacher'] != null)
                      _buildPriceChip('في بيتي', item['priceAtTeacher']),
                    if (item['priceAtStudent'] != null)
                      _buildPriceChip('في بيت الطالب', item['priceAtStudent']),
                    if (item['priceGroup'] != null)
                      _buildPriceChip('مجموعة', item['priceGroup']),
                    if (item['priceAtTeacher'] == null &&
                        item['priceAtStudent'] == null &&
                        item['priceGroup'] == null)
                      const Chip(
                        label: Text('لم يحدد السعر بعد'),
                        backgroundColor: Colors.orange,
                        labelStyle: TextStyle(
                          color: Colors.white,
                          fontSize: 12,
                        ),
                      ),
                  ],
                ),
              ],
            ),
            trailing: PopupMenuButton(
              icon: const Icon(Icons.more_vert),
              itemBuilder: (context) => [
                const PopupMenuItem(
                  value: 'edit',
                  child: Row(
                    children: [
                      Icon(Icons.edit, size: 20),
                      SizedBox(width: 8),
                      Text('تعديل السعر'),
                    ],
                  ),
                ),
                const PopupMenuItem(
                  value: 'delete',
                  child: Row(
                    children: [
                      Icon(Icons.delete, color: Colors.red, size: 20),
                      SizedBox(width: 8),
                      Text('حذف', style: TextStyle(color: Colors.red)),
                    ],
                  ),
                ),
              ],
              onSelected: (value) {
                if (value == 'edit') {
                  _showEditPriceDialog(item);
                } else if (value == 'delete') {
                  _confirmDelete(item['id']);
                }
              },
            ),
          ),
        );
      },
    );
  }

  Widget _buildPriceChip(String label, dynamic price) {
    return Chip(
      label: Text('$label: $price ج.م'),
      backgroundColor: AppColors.primary.withOpacity(0.1),
      labelStyle: const TextStyle(
        color: AppColors.primary,
        fontSize: 11,
        fontFamily: 'Cairo',
      ),
    );
  }

  void _showEditPriceDialog(Map<String, dynamic> item) {
    final priceAtTeacherController = TextEditingController(
      text: item['priceAtTeacher']?.toString() ?? '',
    );
    final priceAtStudentController = TextEditingController(
      text: item['priceAtStudent']?.toString() ?? '',
    );
    final priceGroupController = TextEditingController(
      text: item['priceGroup']?.toString() ?? '',
    );

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text(
          'تعديل الأسعار',
          style: TextStyle(fontFamily: 'Cairo'),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: priceAtTeacherController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                labelText: 'السعر في بيت المعلم',
                suffixText: 'ج.م',
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: priceAtStudentController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                labelText: 'السعر في بيت الطالب',
                suffixText: 'ج.م',
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: priceGroupController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                labelText: 'سعر المجموعة',
                suffixText: 'ج.م',
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('إلغاء'),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(context);
              await ref
                  .read(teacherSubjectsProvider.notifier)
                  .updateSubject(
                    teacherSubjectId: item['id'],
                    priceAtTeacher: int.tryParse(priceAtTeacherController.text),
                    priceAtStudent: int.tryParse(priceAtStudentController.text),
                    priceGroup: int.tryParse(priceGroupController.text),
                  );
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
            child: const Text('حفظ', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  void _confirmDelete(String id) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('حذف المادة', style: TextStyle(fontFamily: 'Cairo')),
        content: const Text('هل أنت متأكد من حذف هذه المادة؟'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('إلغاء'),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(context);
              await ref
                  .read(teacherSubjectsProvider.notifier)
                  .deleteSubject(id);
            },
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('حذف', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }
}

// =============================================
// Add Subject Bottom Sheet (Multi-Select)
// =============================================
class AddSubjectBottomSheet extends ConsumerStatefulWidget {
  const AddSubjectBottomSheet({super.key});

  @override
  ConsumerState<AddSubjectBottomSheet> createState() =>
      _AddSubjectBottomSheetState();
}

class _AddSubjectBottomSheetState extends ConsumerState<AddSubjectBottomSheet> {
  final Set<String> _selectedSubjects = {};
  final Set<String> _selectedStages = {};
  bool _isLoading = false;

  Future<void> _addSubjects() async {
    if (_selectedSubjects.isEmpty || _selectedStages.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('يرجى اختيار مادة ومرحلة واحدة على الأقل'),
          backgroundColor: AppColors.error,
        ),
      );
      return;
    }

    setState(() => _isLoading = true);

    // Create all combinations
    for (final subjectId in _selectedSubjects) {
      for (final stageId in _selectedStages) {
        await ref
            .read(teacherSubjectsProvider.notifier)
            .addSubject(subjectId: subjectId, stageId: stageId);
      }
    }

    setState(() => _isLoading = false);

    if (mounted) {
      Navigator.pop(context);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            'تم إضافة ${_selectedSubjects.length * _selectedStages.length} تركيبة',
          ),
          backgroundColor: AppColors.success,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final subjectsAsync = ref.watch(subjectsProvider);
    final stagesAsync = ref.watch(stagesProvider);

    return Container(
      height: MediaQuery.of(context).size.height * 0.85,
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        children: [
          // Handle
          Container(
            width: 40,
            height: 4,
            margin: const EdgeInsets.symmetric(vertical: 12),
            decoration: BoxDecoration(
              color: Colors.grey[300],
              borderRadius: BorderRadius.circular(2),
            ),
          ),

          // Title
          const Padding(
            padding: EdgeInsets.all(16),
            child: Text(
              'إضافة مواد دراسية',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                fontFamily: 'Cairo',
              ),
            ),
          ),

          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Subjects Section
                  const Text(
                    'اختر المواد',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      fontFamily: 'Cairo',
                    ),
                  ),
                  const SizedBox(height: 8),
                  subjectsAsync.when(
                    data: (subjects) => Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: subjects.map<Widget>((subject) {
                        final isSelected = _selectedSubjects.contains(
                          subject['id'],
                        );
                        return FilterChip(
                          label: Text(
                            subject['nameAr'] ?? subject['name'] ?? '',
                            style: TextStyle(
                              fontFamily: 'Cairo',
                              color: isSelected
                                  ? Colors.white
                                  : AppColors.textPrimary,
                            ),
                          ),
                          selected: isSelected,
                          selectedColor: AppColors.primary,
                          checkmarkColor: Colors.white,
                          onSelected: (selected) {
                            setState(() {
                              if (selected) {
                                _selectedSubjects.add(subject['id']);
                              } else {
                                _selectedSubjects.remove(subject['id']);
                              }
                            });
                          },
                        );
                      }).toList(),
                    ),
                    loading: () => const CircularProgressIndicator(),
                    error: (e, _) => Text('خطأ: $e'),
                  ),

                  const SizedBox(height: 24),

                  // Stages Section
                  const Text(
                    'اختر المراحل',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      fontFamily: 'Cairo',
                    ),
                  ),
                  const SizedBox(height: 8),
                  stagesAsync.when(
                    data: (stages) => Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: stages.map<Widget>((stage) {
                        final isSelected = _selectedStages.contains(
                          stage['id'],
                        );
                        return FilterChip(
                          label: Text(
                            stage['nameAr'] ?? stage['name'] ?? '',
                            style: TextStyle(
                              fontFamily: 'Cairo',
                              color: isSelected
                                  ? Colors.white
                                  : AppColors.textPrimary,
                            ),
                          ),
                          selected: isSelected,
                          selectedColor: AppColors.secondary,
                          checkmarkColor: Colors.black,
                          onSelected: (selected) {
                            setState(() {
                              if (selected) {
                                _selectedStages.add(stage['id']);
                              } else {
                                _selectedStages.remove(stage['id']);
                              }
                            });
                          },
                        );
                      }).toList(),
                    ),
                    loading: () => const CircularProgressIndicator(),
                    error: (e, _) => Text('خطأ: $e'),
                  ),

                  const SizedBox(height: 24),

                  // Summary
                  if (_selectedSubjects.isNotEmpty &&
                      _selectedStages.isNotEmpty)
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        children: [
                          const Icon(
                            Icons.info_outline,
                            color: AppColors.primary,
                          ),
                          const SizedBox(width: 8),
                          Text(
                            'سيتم إضافة ${_selectedSubjects.length * _selectedStages.length} تركيبة',
                            style: const TextStyle(
                              fontFamily: 'Cairo',
                              color: AppColors.primary,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ),
                ],
              ),
            ),
          ),

          // Add Button
          Padding(
            padding: const EdgeInsets.all(16),
            child: SizedBox(
              width: double.infinity,
              height: 56,
              child: ElevatedButton(
                onPressed: _isLoading ? null : _addSubjects,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
                child: _isLoading
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text(
                        'إضافة المواد',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          fontFamily: 'Cairo',
                          color: Colors.white,
                        ),
                      ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
