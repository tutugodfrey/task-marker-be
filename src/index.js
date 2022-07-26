import express from 'express';
import bodyParser from 'body-parser';
import router from './routes/index';
import cors from 'cors';
import { Prometheus } from './helpers';

const app = express();
app.use(cors());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));
app.use('/api', router)

app.get('/metrics', async (req, res) => {
  const metrics = await Prometheus.register.metrics();
  res.set('Content-Type', Prometheus.register.contentType);
  return res.json({ metrics });

});

// important to keep catch-all route last
// app.get('/*', (req, res) => {
//   res.status(200).sendFile('index.html', { root: './public' });
// });

export default app;
