import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:package_info_plus/package_info_plus.dart';
import '../../../core/theme/app_colors.dart';
import '../../auth/providers/auth_provider.dart';
import '../providers/settings_provider.dart';

class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({super.key});

  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends ConsumerState<SettingsScreen> {
  String _version = '';

  @override
  void initState() {
    super.initState();
    _loadVersion();
  }

  Future<void> _loadVersion() async {
    final packageInfo = await PackageInfo.fromPlatform();
    setState(() {
      _version = packageInfo.version;
    });
  }

  @override
  Widget build(BuildContext context) {
    final settings = ref.watch(settingsProvider);
    final user = ref.read(authProvider).user;
    final isTeacher = user?['type'] == 'teacher';

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
        title: const Text(
          'الإعدادات',
          style: TextStyle(
            color: Colors.black,
            fontFamily: 'Cairo',
            fontWeight: FontWeight.bold,
          ),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios, color: Colors.black),
          onPressed: () => context.pop(),
        ),
      ),
      body: settings.isLoading
          ? const Center(
              child: CircularProgressIndicator(color: AppColors.primary),
            )
          : ListView(
              padding: const EdgeInsets.all(16),
              children: [
                // Account Section
                const _SectionHeader(title: 'الحساب'),
                _SettingsTile(
                  icon: Icons.person_outline,
                  title: 'تعديل الملف الشخصي',
                  onTap: () {
                    if (isTeacher) {
                      context.push('/teacher/profile/edit');
                    } else {
                      context.push('/parent/profile/edit');
                    }
                  },
                ),
                if (!isTeacher) ...[
                  const SizedBox(height: 8),
                  _SettingsTile(
                    icon: Icons.location_on_outlined,
                    title: 'تعديل الموقع',
                    onTap: () => context.push('/parent/location/edit'),
                  ),
                ],

                const SizedBox(height: 24),

                // App Settings Section
                const _SectionHeader(title: 'التطبيق'),
                Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Column(
                    children: [
                      SwitchListTile(
                        value: settings.notificationsEnabled,
                        onChanged: (value) {
                          ref
                              .read(settingsProvider.notifier)
                              .toggleNotifications(value);
                        },
                        title: const Text(
                          'الإشعارات',
                          style: TextStyle(
                            fontFamily: 'Cairo',
                            fontWeight: FontWeight.bold,
                            fontSize: 14,
                          ),
                        ),
                        secondary: const Icon(
                          Icons.notifications_outlined,
                          color: AppColors.primary,
                        ),
                        activeThumbColor: AppColors.primary,
                      ),
                      const Divider(height: 1),
                      ListTile(
                        leading: const Icon(
                          Icons.language,
                          color: AppColors.primary,
                        ),
                        title: const Text(
                          'اللغة',
                          style: TextStyle(
                            fontFamily: 'Cairo',
                            fontWeight: FontWeight.bold,
                            fontSize: 14,
                          ),
                        ),
                        trailing: const Text(
                          'العربية', // Currently hardcoded as we only support Arabic MVP
                          style: TextStyle(
                            fontFamily: 'Cairo',
                            color: AppColors.textSecondary,
                            fontSize: 14,
                          ),
                        ),
                        onTap: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text(
                                'التطبيق يدعم اللغة العربية فقط حالياً',
                              ),
                            ),
                          );
                        },
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 24),

                // Support Section
                const _SectionHeader(title: 'الدعم والمساعدة'),
                _SettingsTile(
                  icon: Icons.info_outline,
                  title: 'عن التطبيق',
                  onTap: () {
                    showLicensePage(
                      context: context,
                      applicationName: 'Zads',
                      applicationVersion: _version,
                      applicationLegalese: 'جميع الحقوق محفوظة © 2026',
                    );
                  },
                ),
                const SizedBox(height: 8),
                _SettingsTile(
                  icon: Icons.privacy_tip_outlined,
                  title: 'ياسة الخصوصية',
                  onTap: () {
                    // Open privacy policy URL
                  },
                ),

                const SizedBox(height: 32),

                // Logout Button
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () {
                      showDialog(
                        context: context,
                        builder: (context) => AlertDialog(
                          title: const Text(
                            'تسجيل الخروج',
                            style: TextStyle(fontFamily: 'Cairo'),
                          ),
                          content: const Text(
                            'هل أنت متأكد من تسجيل الخروج؟',
                            style: TextStyle(fontFamily: 'Cairo'),
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
                              onPressed: () {
                                Navigator.pop(context); // Close dialog
                                ref.read(authProvider.notifier).logout();
                                context.go('/login');
                              },
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppColors.error,
                              ),
                              child: const Text(
                                'خروج',
                                style: TextStyle(
                                  fontFamily: 'Cairo',
                                  color: Colors.white,
                                ),
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.white,
                      foregroundColor: AppColors.error,
                      elevation: 0,
                      side: const BorderSide(color: AppColors.error),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                    ),
                    child: const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.logout),
                        SizedBox(width: 8),
                        Text(
                          'تسجيل الخروج',
                          style: TextStyle(
                            fontFamily: 'Cairo',
                            fontWeight: FontWeight.bold,
                            fontSize: 16,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 16),
                Center(
                  child: Text(
                    'الإصدار $_version',
                    style: const TextStyle(
                      color: AppColors.textSecondary,
                      fontSize: 12,
                      fontFamily: 'Cairo',
                    ),
                  ),
                ),
              ],
            ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final String title;

  const _SectionHeader({required this.title});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8, right: 4),
      child: Text(
        title,
        style: const TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.bold,
          color: AppColors.textSecondary,
          fontFamily: 'Cairo',
        ),
      ),
    );
  }
}

class _SettingsTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final VoidCallback onTap;

  const _SettingsTile({
    required this.icon,
    required this.title,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: ListTile(
        leading: Icon(icon, color: AppColors.primary),
        title: Text(
          title,
          style: const TextStyle(
            fontFamily: 'Cairo',
            fontWeight: FontWeight.bold,
            fontSize: 14,
          ),
        ),
        trailing: const Icon(
          Icons.arrow_forward_ios,
          size: 16,
          color: AppColors.textSecondary,
        ),
        onTap: onTap,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      ),
    );
  }
}
