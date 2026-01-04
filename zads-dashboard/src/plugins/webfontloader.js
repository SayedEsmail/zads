/**
 * plugins/webfontloader.js
 *
 * webfontloader documentation: https://github.com/typekit/webfontloader
 */
export async function loadFonts() {
    const webFontLoader = await import(/* webpackChunkName: "webfontloader" */ 'webfontloader')

    webFontLoader.load({
        google: {
            families: [
                'Cairo:wght@300;400;500;600;700&display=swap',
                'Poppins:wght@300;400;500;600;700&display=swap',
            ],
        },
    })
}
export default function () {
    loadFonts()
}
