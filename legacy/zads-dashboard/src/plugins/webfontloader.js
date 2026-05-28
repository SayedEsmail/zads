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
                'IBM Plex Sans Arabic:wght@300;400;500;600;700&display=swap',
            ],
        },
    })
}
export default function () {
    loadFonts()
}
