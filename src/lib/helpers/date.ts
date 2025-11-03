export function today() {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();

    return `${dd}. ${mm}. ${yyyy}` as const;
}

export function dayISO(date: Date = new Date()) {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();

    return `${yyyy}-${mm}-${dd}` as const;
}

export function time() {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');

    return `${hh}:${mm}` as const;
}

export function nowISO() {
    return `${dayISO()}T${time()}`;
}

export function dateFromISO(dateISO: string) {
    const parts = dateISO.split('T')[0].split('-');
    const dd = parts[2];
    const mm = parts[1];
    const yyyy = parts[0];

    return `${dd}. ${mm}. ${yyyy}` as const;
}

export function dateToISO(date: string) {
    const parts = date.split('.');
    const dd = parts[0].trim().padStart(2, '0');
    const mm = parts[1].trim().padStart(2, '0');
    const yyyy = parts[2].trim().padStart(4, '2020');

    return `${yyyy}-${mm}-${dd}` as const;
}

export function timeFromISO(timeISO: string) {
    return timeISO.split('T').at(-1);
}

export function datetimeFromISO(datetimeISO: string) {
    return `${dateFromISO(datetimeISO)} ${timeFromISO(datetimeISO)}`;
}
