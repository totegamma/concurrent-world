export const sanitizeHtml = (unsafe: string) => {
    try {
    return unsafe
        .replaceAll(/&/g, '&amp;')
        .replaceAll(/</g, '&lt;')
        .replaceAll(/>/g, '&gt;')
        .replaceAll(/"/g, '&quot;')
        .replaceAll(/'/g, '&#039;')
    } catch (_) {
        return ""
    }
}
