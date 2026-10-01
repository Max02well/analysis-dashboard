export function formatDate(date: string | Date | null | undefined): string {
    if (!date) return "N/A";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return "N/A";
    }

    return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(parsedDate);
}
//usage -->{formatDate(m.startDate)}

export function formatDateRange(
    startDate: string | Date | null | undefined,
    endDate: string | Date | null | undefined
): string {
    if (!startDate || !endDate) return "N/A";

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (
        Number.isNaN(start.getTime()) ||
        Number.isNaN(end.getTime())
    ) {
        return "N/A";
    }

    const dayMonth = new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
    });

    const year = new Intl.DateTimeFormat("en-GB", {
        year: "numeric",
    });

    return `${dayMonth.format(start)} – ${dayMonth.format(end)} ${year.format(end)}`;
}

//usage -->{formatDateRange(m.startDate, m.endDate)}


const MONTHS = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
];

export function formatTime(
    date: string | Date | null | undefined
): string {
    if (!date) return "—";

    const parsedDate = date instanceof Date ? date : new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return "—";
    }

    const parts = new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        timeZone: "Africa/Nairobi",
    }).formatToParts(parsedDate);

    const day = parts.find((part) => part.type === "day")?.value;
    const month = parts.find((part) => part.type === "month")?.value;
    const year = parts.find((part) => part.type === "year")?.value;

    if (!day || !month || !year) return "—";

    return `${day} ${MONTHS[Number(month) - 1]} ${year}`;
}