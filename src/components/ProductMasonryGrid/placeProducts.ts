/**
 * Organiza cards em colunas, encaixando cada novo produto na coluna
 * que estiver livre primeiro. Os valores representam pixels CSS.
 * A ordem do array de entrada nunca é modificada.
 */
export type MasonryPlacement = {
    column: number;
    start: number;
    span: number;
};

export function placeProducts(
    heights: number[],
    columns: number,
    gap: number,
): MasonryPlacement[] {
    const count = Math.max(1, Math.floor(columns) || 1);
    const safeGap = Math.max(0, Math.round(gap) || 0);

    // Desalinhamento editorial visível, mas limitado para evitar grandes vazios.
    // Em telas menores, usamos deslocamentos menores.
    const maxHeight = heights.length ? Math.max(1, ...heights) : 320;
    const shift = Math.round(Math.min(72, Math.max(24, maxHeight * 0.12)));
    const offsets = count >= 4
        ? [0, shift, Math.round(shift * 0.35), 0]
        : count === 3
            ? [0, shift, Math.round(shift * 0.35)]
            : count === 2
                ? [0, Math.round(shift * 0.45)]
                : [0];

    const ends = Array.from({ length: count }, (_, index) => 1 + offsets[index]);

    return heights.map((height, index) => {
        // Primeira fileira, sempre em ordem da esquerda para a direita.
        // Depois, preenche a coluna que terminou primeiro.
        const column = index < count
            ? index
            : ends.indexOf(Math.min(...ends));
        const start = ends[column];
        const span = Math.max(1, Math.ceil(Number.isFinite(height) ? height : 1));

        ends[column] = start + span + safeGap;

        return { column: column + 1, start, span };
    });
}
