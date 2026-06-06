// mock-server.js
const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

server.use(middlewares);

// Custom routes for auth
server.post('/api/auth/login', (req, res) => {
  const { phone } = req.body;
  res.json({ message: "OTP sent successfully", phone });
});

server.post('/api/auth/verify', (req, res) => {
  const { phone } = req.body;
  let user = router.db.get('users').find({ phone }).value();

  if (!user) {
    user = {
      id: Date.now().toString(),
      name: "New User",
      age: 26,
      gender: "male",
      phone,
      bio: "Welcome to Paye!",
      photos: ["https://i.pravatar.cc/300?u=newuser"],
      avgRating: 4.5
    };
    router.db.get('users').push(user).write();
  }

  res.json({
    user,
    token: "mock-jwt-token-" + Date.now()
  });
});

server.get('/api/matching/suggestions', (req, res) => {
  res.json(router.db.get('users').value());
});

server.post('/api/requests', (req, res) => {
  const newRequest = { 
    id: Date.now().toString(), 
    ...req.body, 
    status: "pending",
    createdAt: new Date().toISOString()
  };
  router.db.get('requests').push(newRequest).write();
  res.json(newRequest);
});

server.use('/api', router);

server.listen(5000, () => {
  console.log('🚀 JSON Mock Server is running at http://localhost:5000');
});