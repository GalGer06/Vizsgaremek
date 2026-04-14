import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Segédfüggvény a képek Base64 formátumba való kódolásához seeder-szinten.
 * @param fileName A kép neve a prisma/assets mappában
 * @param mimeType A kép MIME típusa (alapértelmezett: image/jpeg)
 */
export function getBase64Image(fileName: string, mimeType: string = 'image/jpeg'): string {
    try {
        // A prisma mappán belüli assets könyvtár elérése
        const path = join(__dirname, '..', 'assets', fileName);
        const file = readFileSync(path);
        return `data:${mimeType};base64,${file.toString('base64')}`;
    } catch (error) {
        console.warn(`⚠️ Nem sikerült betölteni a képet: ${fileName}. Hiba:`, error.message);
        return '';
    }
}
