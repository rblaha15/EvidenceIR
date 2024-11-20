
export function today() {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();

    return `${dd}. ${mm}. ${yyyy}`;
}

export function todayISO() {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();

    return `${yyyy}-${mm}-${dd}`;
}

export function dateFromISO(dateISO: string) {
    const parts = dateISO.split('-');
    const dd = parts[2]
    const mm = parts[1]
    const yyyy = parts[0]

    return `${dd}. ${mm}. ${yyyy}`;
}
