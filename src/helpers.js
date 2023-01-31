import jwt from 'jsonwebtoken';
import dotenv from 'dotenv-safe';
import * as Prometheus from "prom-client";

dotenv.config()
const { JWT_SECRET } = process.env;

const genToken = async (user) =>  {
  const token = await jwt.sign({
    user
  }, JWT_SECRET, { expiresIn: 60 * 60 });
  return token;
}

const authUser = async (req, res, next) => {
  const token = req.headers.token;
  if (!token) return res.status(401).json({ message: 'Please provide a token' });
  try {

    const decoded = jwt.verify(token, JWT_SECRET);
    req.body.userId = decoded.user.id;

    // temp hold user obj when unloading files
    req.userObj = {
      userId: decoded.user.id,
    }
    return next()
  } catch(err) {
    // err
    return res.status(401).json({ message: 'invalid token' })
  }
}

// Collect prometheus metrics
const collectDefaultMetrics = Prometheus.collectDefaultMetrics;
const Registry = Prometheus.Registry;
const registry = new Registry();
const metrics = collectDefaultMetrics({ registry });

const counter = new Prometheus.Counter({
  name: 'node_request_operations_total',
  help: 'The total number of requests received'
});

const histogram = new Prometheus.Histogram({
  name: 'node_request_duration_seconds',
  help: 'Histogram for duration of requests in seconds',
  buckets: [1, 2, 3, 4, 5, 6],
  labelNames: [ 'method', 'path', 'status', 'message' ]
});

export {
  genToken,
  authUser,
  counter,
  histogram,
  Prometheus
}
