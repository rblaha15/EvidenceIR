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

export function time() {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');

    return `${hh}:${mm}`;
}

export function nowISO() {
    return `${todayISO()}T${time()}`;
}

export function dateFromISO(dateISO: string) {
    const parts = dateISO.split('T')[0].split('-');
    const dd = parts[2]
    const mm = parts[1]
    const yyyy = parts[0]

    return `${dd}. ${mm}. ${yyyy}`;
}
