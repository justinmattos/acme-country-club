const {
  db,
  syncAndSeed,
  models: { Member, Booking, Facility },
} = require('./db');
const express = require('express');
const { get } = require('http');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/api/facilities', async (req, res, next) => {
  try {
    res.send(await Facility.findAll());
  } catch (err) {
    next(err);
  }
});

app.get('/api/bookings', async (req, res, next) => {
  try {
    res.send(
      await Booking.findAll({
        include: [{ model: Facility }, { model: Member, as: 'bookedBy' }],
      })
    );
  } catch (err) {
    next(err);
  }
});

app.get('/api/members', async (req, res, next) => {
  try {
    res.send(
      await Member.findAll({
        include: [
          { model: Member, as: 'sponsor' },
          { model: Member, as: 'sponsorees' },
        ],
      })
    );
  } catch (err) {
    next(err);
  }
});

const init = async () => {
  try {
    await db.sync({ force: true });
    await syncAndSeed();
    app.listen(PORT, () => console.log(`App running on PORT: ${PORT}`));
  } catch (err) {
    console.log(err);
  }
};

init();
