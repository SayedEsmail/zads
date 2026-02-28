import api from '~/services/api'

export const useAnalytics = () => {
    const logWhatsAppClick = async (teacherId, phoneNumber) => {
        try {
            await api.post('/analytics/whatsapp-click', { teacherId })
        } catch (error) {
            console.error('Failed to log WhatsApp click:', error)
        } finally {
            // Always open WhatsApp, even if logging fails
            // Format phone number (remove leading zero if necessary, ensure country code)
            const formattedPhone = phoneNumber.startsWith('0') ? `2${phoneNumber}` : phoneNumber
            window.open(`https://wa.me/${formattedPhone}`, '_blank')
        }
    }

    return { logWhatsAppClick }
}
