export const getOrdinalDate = (dateString) => {
  if (!dateString) return "";
  
  const date = new Date(dateString);
  const day = date.getDate();
  const year = date.getFullYear();
  const month = date.toLocaleString('en-IN', { month: 'long' });

  return `${day}${getSuffix(day)} ${month} ${year}`;
};

const getSuffix = (day) => {
  if (day > 3 && day < 21) return 'th';
  switch (day % 10) {
    case 1: return "st";
    case 2: return "nd";
    case 3: return "rd";
    default: return "th";
  }
};

export const getOrdinalDateTime = (dateString) => {
  if (!dateString) return "";
  
  const date = new Date(dateString);
  const day = date.getDate();
  const year = date.getFullYear();
  const month = date.toLocaleString('en-IN', { month: 'long' });
  
  // Format time (e.g., 10:30 PM)
  const time = date.toLocaleString('en-IN', { 
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: true 
  }).toUpperCase();

  return `${day}${getSuffix(day)} ${month} ${year}, ${time}`;
};