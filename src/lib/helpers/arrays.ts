export const chunk = <T>(arr: T[], size: number): T[][] => window(arr, size, size, true);

export const window = <T>(arr: T[], size: number, step: number = 1, partialWindows: boolean = false): T[][] => {
    if (size <= 0 || step <= 0) throw new RangeError("Size and step bust be positive");

    const thisSize = arr.length;
    const resultCapacity = Math.floor(thisSize / step) + (thisSize % step == 0 ? 0 : 1);
    const result = Array<T[]>(resultCapacity);
    let index = 0;
    let arrayIndex = 0;
    while (0 <= index && index < thisSize) {
        const windowSize = Math.min(size, thisSize - index);
        if (windowSize < size && !partialWindows) break;
        result[arrayIndex++] = Array.from(Array(windowSize), (_, i) => arr[i + index]);
        index += step;
    }
    return result;
};

