import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../teacher/providers/teacher_provider.dart';
import '../providers/parent_provider.dart';

class ParentChildrenManageScreen extends ConsumerStatefulWidget {
  const ParentChildrenManageScreen({super.key});

  @override
  ConsumerState<ParentChildrenManageScreen> createState() =>
      _ParentChildrenManageScreenState();
}

class _ParentChildrenManageScreenState
    extends ConsumerState<ParentChildrenManageScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      ref.read(parentChildrenProvider.notifier).loadChildren();
      ref.refresh(stagesProvider);
      ref.refresh(subjectsProvider);
    });
  }

  void _showChildDialog([Map<String, dynamic>? child]) {
    final isEditing = child != null;
    final nameController = TextEditingController(text: child?['name']);
    String? selectedStageId = child?['stageId'] ?? child?['stage']?['id'];

    List<String> selectedSubjectIds = [];
    if (child != null && child['subjects'] != null) {
      for (var s in child['subjects']) {
        if (s['subject'] != null && s['subject']['id'] != null) {
          selectedSubjectIds.add(s['subject']['id']);
        }
      }
    }

    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) {
          final stagesAsync = ref.watch(stagesProvider);
          final subjectsAsync = ref.watch(subjectsProvider);

          return AlertDialog(
            title: Text(
              isEditing ? 'تعديل بيانات الابن' : 'إضافة ابن',
              style: const TextStyle(fontFamily: 'Cairo'),
            ),
            content: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  TextField(
                    controller: nameController,
                    decoration: const InputDecoration(
                      labelText: 'الاسم',
                      labelStyle: TextStyle(fontFamily: 'Cairo'),
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'المرحلة الدراسية',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontFamily: 'Cairo',
                    ),
                  ),
                  const SizedBox(height: 8),
                  stagesAsync.when(
                    data: (stages) => DropdownButtonFormField<String>(
                      initialValue: selectedStageId,
                      decoration: const InputDecoration(
                        border: OutlineInputBorder(),
                        hintText: 'اختر المرحلة',
                        hintStyle: TextStyle(fontFamily: 'Cairo'),
                      ),
                      items: stages.map<DropdownMenuItem<String>>((stage) {
                        return DropdownMenuItem(
                          value: stage['id'],
                          child: Text(
                            stage['nameAr'] ?? '',
                            style: const TextStyle(fontFamily: 'Cairo'),
                          ),
                        );
                      }).toList(),
                      onChanged: (value) {
                        setDialogState(() {
                          selectedStageId = value;
                        });
                      },
                    ),
                    loading: () => const CircularProgressIndicator(),
                    error: (err, stack) => Text('خطأ: $err'),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'المواد المطلوبة',
                    style: TextStyle(
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
                        final isSelected = selectedSubjectIds.contains(
                          subject['id'],
                        );
                        return FilterChip(
                          label: Text(
                            subject['nameAr'] ?? '',
                            style: const TextStyle(fontFamily: 'Cairo'),
                          ),
                          selected: isSelected,
                          onSelected: (selected) {
                            setDialogState(() {
                              if (selected) {
                                selectedSubjectIds.add(subject['id']);
                              } else {
                                selectedSubjectIds.remove(subject['id']);
                              }
                            });
                          },
                        );
                      }).toList(),
                    ),
                    loading: () => const CircularProgressIndicator(),
                    error: (err, stack) => Text('خطأ: $err'),
                  ),
                ],
              ),
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text(
                  'إلغاء',
                  style: TextStyle(fontFamily: 'Cairo'),
                ),
              ),
              ElevatedButton(
                onPressed: () async {
                  if (nameController.text.isEmpty || selectedStageId == null) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('يرجى إدخال الاسم واختيار المرحلة'),
                      ),
                    );
                    return;
                  }

                  if (isEditing) {
                    await ref
                        .read(parentChildrenProvider.notifier)
                        .updateChild(
                          childId: child['id'],
                          name: nameController.text,
                          stageId: selectedStageId,
                          subjectIds: selectedSubjectIds,
                        );
                  } else {
                    await ref
                        .read(parentChildrenProvider.notifier)
                        .addChild(
                          name: nameController.text,
                          stageId: selectedStageId!,
                          subjectIds: selectedSubjectIds,
                        );
                  }

                  if (context.mounted) {
                    Navigator.pop(context);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(
                          isEditing
                              ? 'تم حفظ التعديلات بنجاح'
                              : 'تم إضافة الابن بنجاح',
                        ),
                      ),
                    );
                  }
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                ),
                child: Text(
                  isEditing ? 'حفظ' : 'إضافة',
                  style: const TextStyle(
                    fontFamily: 'Cairo',
                    color: Colors.white,
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final childrenState = ref.watch(parentChildrenProvider);

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios, color: Colors.black),
          onPressed: () => context.pop(),
        ),
        title: const Text(
          'أبنائي',
          style: TextStyle(
            color: Colors.black,
            fontFamily: 'Cairo',
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      body: childrenState.isLoading
          ? const Center(
              child: CircularProgressIndicator(color: AppColors.primary),
            )
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Info Card
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: AppColors.primary.withOpacity(0.3),
                      ),
                    ),
                    child: Row(
                      children: [
                        Icon(Icons.info_outline, color: AppColors.primary),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            'أضف أبناءك والمواد المطلوبة للبحث عن المعلمين المناسبين',
                            style: TextStyle(
                              fontSize: 13,
                              color: AppColors.primary,
                              fontFamily: 'Cairo',
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 24),

                  // Header
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'الأبناء',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          fontFamily: 'Cairo',
                        ),
                      ),
                      ElevatedButton.icon(
                        onPressed: () => _showChildDialog(),
                        icon: const Icon(Icons.add, color: Colors.white),
                        label: const Text(
                          'إضافة',
                          style: TextStyle(
                            fontFamily: 'Cairo',
                            color: Colors.white,
                          ),
                        ),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primary,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                          ),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 16),

                  // Children List
                  if (childrenState.children.isEmpty)
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(32),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Column(
                        children: [
                          Icon(
                            Icons.child_care,
                            size: 48,
                            color: AppColors.textSecondary,
                          ),
                          const SizedBox(height: 16),
                          const Text(
                            'لم تضف أي أبناء بعد',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              fontFamily: 'Cairo',
                            ),
                          ),
                          const SizedBox(height: 8),
                          const Text(
                            'اضغط على "إضافة" لإضافة ابن جديد',
                            style: TextStyle(
                              fontSize: 13,
                              color: AppColors.textSecondary,
                              fontFamily: 'Cairo',
                            ),
                          ),
                        ],
                      ),
                    )
                  else
                    ...childrenState.children.map((child) {
                      final subjects = (child['subjects'] as List? ?? []);
                      final subjectNames = subjects
                          .map((s) => s['subject']?['nameAr'] ?? '')
                          .where((s) => s.isNotEmpty)
                          .join('، ');

                      return Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: AppColors.border),
                        ),
                        child: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: AppColors.primary.withOpacity(0.1),
                                borderRadius: BorderRadius.circular(16),
                              ),
                              child: const Icon(
                                Icons.person,
                                color: AppColors.primary,
                                size: 24,
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    child['name'] ?? '',
                                    style: const TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.bold,
                                      fontFamily: 'Cairo',
                                    ),
                                  ),
                                  Text(
                                    child['stage']?['nameAr'] ?? '',
                                    style: const TextStyle(
                                      fontSize: 13,
                                      color: AppColors.textSecondary,
                                      fontFamily: 'Cairo',
                                    ),
                                  ),
                                  if (subjectNames.isNotEmpty)
                                    Text(
                                      subjectNames,
                                      style: const TextStyle(
                                        fontSize: 12,
                                        color: AppColors.primary,
                                        fontFamily: 'Cairo',
                                      ),
                                      maxLines: 2,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                ],
                              ),
                            ),
                            IconButton(
                              icon: const Icon(
                                Icons.edit_outlined,
                                color: AppColors.primary,
                              ),
                              onPressed: () => _showChildDialog(child),
                            ),
                            IconButton(
                              icon: const Icon(
                                Icons.delete_outline,
                                color: AppColors.error,
                              ),
                              onPressed: () async {
                                final confirm = await showDialog<bool>(
                                  context: context,
                                  builder: (context) => AlertDialog(
                                    title: const Text(
                                      'تأكيد الحذف',
                                      style: TextStyle(fontFamily: 'Cairo'),
                                    ),
                                    content: Text(
                                      'هل تريد حذف ${child['name']}؟',
                                      style: const TextStyle(
                                        fontFamily: 'Cairo',
                                      ),
                                    ),
                                    actions: [
                                      TextButton(
                                        onPressed: () =>
                                            Navigator.pop(context, false),
                                        child: const Text(
                                          'إلغاء',
                                          style: TextStyle(fontFamily: 'Cairo'),
                                        ),
                                      ),
                                      ElevatedButton(
                                        onPressed: () =>
                                            Navigator.pop(context, true),
                                        style: ElevatedButton.styleFrom(
                                          backgroundColor: AppColors.error,
                                        ),
                                        child: const Text(
                                          'حذف',
                                          style: TextStyle(
                                            fontFamily: 'Cairo',
                                            color: Colors.white,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                );

                                if (confirm == true) {
                                  await ref
                                      .read(parentChildrenProvider.notifier)
                                      .deleteChild(child['id']);
                                  if (context.mounted) {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      const SnackBar(
                                        content: Text('تم الحذف بنجاح'),
                                      ),
                                    );
                                  }
                                }
                              },
                            ),
                          ],
                        ),
                      );
                    }),
                ],
              ),
            ),
    );
  }
}
