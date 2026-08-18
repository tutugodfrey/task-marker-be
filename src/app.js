import app from './index.js';

const port = process.env.PORT || 3005;
app.listen(port, () => {
  console.log(`Todo-er start on port ${port}`)
});
