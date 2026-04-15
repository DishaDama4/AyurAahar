// Global CSRF token helper - used everywhere
export const getCookie = (name) => {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
};

export const getCSRFToken = () => getCookie('csrftoken');

// Fetch CSRF token once - returns promise
export const fetchCSRFToken = () => {
  return fetch("https://ayuraahar.onrender.com/api/csrf/", {
    credentials: "include"
  });
};
