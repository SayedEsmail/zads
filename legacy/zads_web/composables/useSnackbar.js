export const useSnackbar = () => {
    const isVisible = useState('snackbar-visible', () => false)
    const message = useState('snackbar-message', () => '')
    const color = useState('snackbar-color', () => 'success')

    const show = (msg, col = 'success') => {
        message.value = msg
        color.value = col
        isVisible.value = true
    }

    // Provide both `show` and `showSnackbar` aliases to adapt to everywhere it was used inconsistently
    return {
        isVisible,
        message,
        color,
        show,
        showSnackbar: show
    }
}
