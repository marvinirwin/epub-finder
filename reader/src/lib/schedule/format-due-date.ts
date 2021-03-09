import {format} from "date-fns";

export const formatDueDate = (d: Date) => format(d, 'LLL do hbbb')