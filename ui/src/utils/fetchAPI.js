// const URL = 'https://oesukam.github.io';
const URL = 'http://localhost:3000/api/v1';

const defaultOptions = {
  method: "GET",
  // mode: "no-cors",
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "Accept": "application/json"
  },
};

const fetchAPI = (endpoint, config) => new Promise((resolve, reject) => {
  let options = {
    ...defaultOptions,
    ...config,
  }
  // Converts a given json body to string
  if (options.body) {
    options.body = JSON.stringify(options.body);
  }
  
  fetch(`${URL}${endpoint}`, options)
    .then((res) => res.json())
    .then((res) => {
      resolve(res)
    })
    .catch((err) => reject(err));
})

export default fetchAPI;