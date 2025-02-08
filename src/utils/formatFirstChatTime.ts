import datetimeDifference from "datetime-difference";

export const formatFirstChatTime = (createdAt: Date) => {
  const currentDate = new Date();
  const chatDate = new Date(createdAt);
  const result = datetimeDifference(chatDate, currentDate);

  if (result.years > 0) {
    const date = new Date(createdAt).toLocaleDateString('en-US');
    const time = new Date(createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric' });

    return `${date}, ${time}`;
  };

  if (result.months >= 0 && result.days > 6) {
    return new Date(createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric' });
  };

  if (result.months === 0 && result.days > 0) {
    const day = new Date(createdAt).toLocaleDateString('en-US', { weekday: 'short' })
    const time = new Date(createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric' });

    return `${day} ${time}`;
  };

  return new Date(createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric' });
};