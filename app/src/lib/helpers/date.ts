export function today() {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();

    return `${dd}. ${mm}. ${yyyy}` as const;
}

export function dayISO(utc: Boolean = false) {
    const date = new Date();
    const d = utc ? date.getUTCDate() : date.getDate();
    const m = utc ? date.getUTCMonth() : date.getMonth();
    const dd = String(d).padStart(2, '0');
    const mm = String(m + 1).padStart(2, '0');
    const yyyy = utc ? date.getUTCFullYear() : date.getFullYear();

    return `${yyyy}-${mm}-${dd}` as const;
}

export function time(utc: Boolean = false) {
    const now = new Date();
    const h = utc ? now.getUTCHours() : now.getHours();
    const m = utc ? now.getUTCMinutes() : now.getMinutes();
    const hh = String(h).padStart(2, '0');
    const mm = String(m).padStart(2, '0');

    return `${hh}:${mm}` as const;
}

export function nowISO(utc: Boolean = false) {
    return `${dayISO(utc)}T${time(utc)}`;
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
    return timeISO.split('T').at(-1)!.split('.')[0];
}

export function datetimeFromISO(datetimeISO: string) {
    return `${dateFromISO(datetimeISO)} ${timeFromISO(datetimeISO)}`;
}
