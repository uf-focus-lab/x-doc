// Sort source files 
export function compare_path(_a, _b) {
    const a = _a.split('/'), b = _b.split('/');
    while (a.length && b.length) {
        const [x, y] = [a.shift(), b.shift()]
        if (x === y) continue;
        // Index file first
        if (x === 'index') return -1;
        if (y === 'index') return 1;
        // Shorter path first
        return 0;
    }
};
