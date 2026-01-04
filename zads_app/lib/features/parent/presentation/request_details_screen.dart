import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';

class RequestDetailsScreen extends ConsumerStatefulWidget {
  final Map<String, dynamic> request;

  const RequestDetailsScreen({super.key, required this.request});

  @override
  ConsumerState<RequestDetailsScreen> createState() =>
      _RequestDetailsScreenState();
}

class _RequestDetailsScreenState extends ConsumerState<RequestDetailsScreen> {
  bool _isLoading = false;

  Future<void> _toggleStatus() async {
    setState(() => _isLoading = true);

    final currentStatus = widget.request['status'];
    final newStatus = currentStatus == 'active' ? 'closed' : 'active';

    // TODO: Call API to update status
    await Future.delayed(const Duration(seconds: 1));

    if (mounted) {
      setState(() => _isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            newStatus == 'active' ? 'تم تفعيل الطلب' : 'تم إيقاف الطلب',
          ),
        ),
      );
      context.pop();
    }
  }

  Future<void> _deleteRequest() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('تأكيد الحذف', style: TextStyle(fontFamily: 'Cairo')),
        content: const Text(
          'هل تريد حذف هذا الطلب؟',
          style: TextStyle(fontFamily: 'Cairo'),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('إلغاء', style: TextStyle(fontFamily: 'Cairo')),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.error),
            child: const Text(
              'حذف',
              style: TextStyle(fontFamily: 'Cairo', color: Colors.white),
            ),
          ),
        ],
      ),
    );

    if (confirm == true) {
      setState(() => _isLoading = true);
      // TODO: Call API to delete
      await Future.delayed(const Duration(seconds: 1));

      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('تم حذف الطلب')));
        context.pop();
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final subject = widget.request['subject'];
    final stage = widget.request['stage'];
    final contactCount = widget.request['contactCount'] ?? 0;
    final status = widget.request['status'];
    final isActive = status == 'active';

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.primary,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios, color: Colors.white),
          onPressed: () => context.pop(),
        ),
        title: Text(
          subject?['nameAr'] ?? 'تفاصيل الطلب',
          style: const TextStyle(
            color: Colors.white,
            fontFamily: 'Cairo',
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Request Info Card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.primary.withOpacity(0.3)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(
                          Icons.book,
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
                              subject?['nameAr'] ?? 'مادة',
                              style: const TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                                fontFamily: 'Cairo',
                              ),
                            ),
                            Text(
                              stage?['nameAr'] ?? 'مرحلة',
                              style: const TextStyle(
                                fontSize: 14,
                                color: AppColors.textSecondary,
                                fontFamily: 'Cairo',
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Teachers Section
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'المعلمون المهتمون',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    fontFamily: 'Cairo',
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    '$contactCount معلم',
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      color: AppColors.primary,
                      fontFamily: 'Cairo',
                    ),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 16),

            // Teachers List or Empty State
            if (contactCount == 0)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(48),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Column(
                  children: [
                    Icon(
                      Icons.people_outline,
                      size: 64,
                      color: AppColors.textSecondary,
                    ),
                    const SizedBox(height: 16),
                    const Text(
                      'لا يوجد معلمون مهتمون بعد',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        fontFamily: 'Cairo',
                      ),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'سيتم إشعارك عندما يتواصل معلم معك',
                      style: TextStyle(
                        fontSize: 13,
                        color: AppColors.textSecondary,
                        fontFamily: 'Cairo',
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              )
            else
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: const Center(
                  child: Text(
                    'قريباً: عرض قائمة المعلمين المهتمين',
                    style: TextStyle(
                      fontSize: 14,
                      color: AppColors.textSecondary,
                      fontFamily: 'Cairo',
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
      floatingActionButton: _isLoading
          ? null
          : SpeedDial(
              icon: Icons.more_vert,
              activeIcon: Icons.close,
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
              children: [
                SpeedDialChild(
                  icon: isActive ? Icons.pause : Icons.play_arrow,
                  label: isActive ? 'إيقاف الطلب' : 'تفعيل الطلب',
                  backgroundColor: isActive ? Colors.orange : AppColors.success,
                  onTap: _toggleStatus,
                ),
                SpeedDialChild(
                  icon: Icons.delete,
                  label: 'حذف الطلب',
                  backgroundColor: AppColors.error,
                  onTap: _deleteRequest,
                ),
              ],
            ),
    );
  }
}

// Speed Dial Widget (Simple Implementation)
class SpeedDial extends StatefulWidget {
  final IconData icon;
  final IconData activeIcon;
  final Color backgroundColor;
  final Color foregroundColor;
  final List<SpeedDialChild> children;

  const SpeedDial({
    super.key,
    required this.icon,
    required this.activeIcon,
    required this.backgroundColor,
    required this.foregroundColor,
    required this.children,
  });

  @override
  State<SpeedDial> createState() => _SpeedDialState();
}

class _SpeedDialState extends State<SpeedDial> {
  bool _isOpen = false;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        if (_isOpen)
          ...widget.children.map((child) {
            return Padding(
              padding: const EdgeInsets.only(bottom: 16),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 6,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(8),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.1),
                          blurRadius: 4,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Text(
                      child.label,
                      style: const TextStyle(
                        fontFamily: 'Cairo',
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  FloatingActionButton(
                    mini: true,
                    backgroundColor: child.backgroundColor,
                    onPressed: () {
                      setState(() => _isOpen = false);
                      child.onTap();
                    },
                    child: Icon(child.icon, color: Colors.white),
                  ),
                ],
              ),
            );
          }),
        FloatingActionButton(
          backgroundColor: widget.backgroundColor,
          onPressed: () => setState(() => _isOpen = !_isOpen),
          child: Icon(
            _isOpen ? widget.activeIcon : widget.icon,
            color: widget.foregroundColor,
          ),
        ),
      ],
    );
  }
}

class SpeedDialChild {
  final IconData icon;
  final String label;
  final Color backgroundColor;
  final VoidCallback onTap;

  const SpeedDialChild({
    required this.icon,
    required this.label,
    required this.backgroundColor,
    required this.onTap,
  });
}
