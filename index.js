
fetch('https://ipapi.co/197.211.58.129/json/')
.then(res => res.json())
.then(res => console.log(res));