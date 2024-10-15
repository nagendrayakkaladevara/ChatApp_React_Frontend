export const formatDate = (isoString: string): string => {
    const date = new Date(isoString);

    // Get components from the date
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();

    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    // Format the date and time in a readable format
    return `${day} ${month} ${year}, ${hours}:${minutes}:${seconds}`;
};


// export const convertTimestamp = (timestamp: string): string => {
//     const date = new Date(timestamp);
//     return date.toLocaleString('en-US', {
//         year: 'numeric',
//         month: 'long',
//         day: 'numeric',
//         hour: 'numeric',
//         minute: 'numeric',
//         second: 'numeric',
//         hour12: true,
//         timeZone: 'UTC',
//     });
// };

export const convertTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const today = new Date();

    const isToday = date.toDateString() === today.toDateString();

    // only time if the date is today
    if (isToday) {
        return date.toLocaleString('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            hour12: true,
        });
    }

    // date and time if the date is not today
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: true,
    });
};

export const phoneNumberRegex = /^[0-9]{10}$/;

export function removeDomainFromEmail(email: string): string {
    if (!email || !email.includes('@')) {
        return email;
    }

    const [username] = email.split('@');
    return username;
}

export const convertDate = (timestamp: string): string => {
    const date = new Date(timestamp);
    const today = new Date();

    const isToday = date.toDateString() === today.toDateString();

    if (isToday) {
        return 'Today';
    }

    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};
