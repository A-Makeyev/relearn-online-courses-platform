export const CURRENCY_SYMBOL = '₪' // $ €

export const adjustPrice = (num) => {
    const value = Number(num) || 0
    let price = (Math.round(value * 100) / 100).toFixed(2)
    return CURRENCY_SYMBOL + price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export const formatCompactNumber = (num) => {
    const value = Number(num) || 0

    if (value >= 1000000) return `${(value / 1000000).toFixed(1).replace(/\.0$/, '')}M`
    if (value >= 1000) return `${(value / 1000).toFixed(1).replace(/\.0$/, '')}K`
    return String(value)
}

export const getInitials = (name = '') => {
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(part => part[0]?.toUpperCase() || '')
        .join('') || 'U'
}

export const parseList = (value) => {
    if (!value) return []
    if (Array.isArray(value)) return value.filter(Boolean)

    return String(value)
        .split(/[,\n]/)
        .map(item => item.trim())
        .filter(Boolean)
}

export const formatDate = (date) => {
    if (!date) return ''

    const parsed = new Date(date)
    if (Number.isNaN(parsed.getTime())) return ''

    return parsed.toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric'
    })
}

export const formatDateAndTime = (date, includeTime) => {
    const parsed = new Date(date)

    if (Number.isNaN(parsed.getTime())) return ''

    let time = parsed.toLocaleString('en-US', {
        hour12: true,
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
    })

    let dateAndTimeString = `${String(parsed.getDate()).padStart(2, '0')}/${String(parsed.getMonth() + 1).padStart(2, '0')}/${parsed.getFullYear()} ~ ${time}`

    if (includeTime) {
        return dateAndTimeString
    }
    return dateAndTimeString.substring(0, 10)
}

export const getCurrentDateAndTime = (includeTime, US) => {
    let date = new Date()
    let dd = String(date.getDate()).padStart(2, '0')
    let mm = String(date.getMonth() + 1).padStart(2, '0')
    let yyyy = date.getFullYear()
    let time = date.toLocaleString('en-US', {
        hour12: true,
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
    })

    let dateAndTimeString = (US ? `${mm}/${dd}/${yyyy}` : `${dd}/${mm}/${yyyy}`) + ` ~ ${time}`
    if (includeTime) {
        return dateAndTimeString
    }
    return dateAndTimeString.substring(0, 10)
}

export const timeSince = (time) => {
    time = new Date(time)

    switch (typeof time) {
        case 'number':
            break
        case 'string':
            time = +new Date(time)
            break
        case 'object':
            if (time.constructor === Date) time = time.getTime()
            break
        default:
            time = +new Date()
    }

    var time_formats = [
        [60, 'seconds', 1],
        [120, '1 minute ago', '1 minute from now'],
        [3600, 'minutes', 60],
        [7200, '1 hour ago', '1 hour from now'],
        [86400, 'hours', 3600],
        [172800, 'Yesterday', 'Tomorrow'],
        [604800, 'days', 86400],
        [1209600, 'Last week', 'Next week'],
        [2419200, 'weeks', 604800],
        [4838400, 'Last month', 'Next month'],
        [29030400, 'months', 2419200],
        [58060800, 'Last year', 'Next year'],
        [2903040000, 'years', 29030400],
        [5806080000, 'Last century', 'Next century'],
        [58060800000, 'centuries', 2903040000]
    ]

    var seconds = (+new Date() - time) / 1000,
        token = 'ago',
        list_choice = 1

    if (seconds < 1) {
        return 'Just now'
    }

    if (seconds < 0) {
        seconds = Math.abs(seconds)
        token = 'from now'
        list_choice = 2
    }

    for (let i = 0; i < time_formats.length; i++) {
        const format = time_formats[i]

        if (seconds < format[0]) {
            if (typeof format[2] == 'string') {
                return format[list_choice]
            }

            return Math.floor(seconds / format[2]) + ' ' + format[1] + ' ' + token
        }
    }

    const lastFormat = time_formats[time_formats.length - 1]
    return Math.floor(seconds / lastFormat[2]) + ' ' + lastFormat[1] + ' ' + token
}

export const generateId = () => {
    return `${Date.now().toString(36).slice(-5)}-${Math.random().toString(36).slice(3, 6)}`
}
