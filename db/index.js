const { Sequelize, DataTypes, UUIDV4 } = require('sequelize');
const db = new Sequelize(
  process.env.DATABASE_URL || 'postgres://localhost:5432/acme_country_club',
  { logging: false }
);

class Facility extends Sequelize.Model {}
class Member extends Sequelize.Model {}
class Booking extends Sequelize.Model {}

Facility.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: UUIDV4,
    },
    fac_name: {
      type: DataTypes.STRING(100),
      unique: true,
      allowNull: false,
    },
  },
  { sequelize: db, modelName: 'facilities' }
);

Member.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: UUIDV4,
    },
    first_name: {
      type: DataTypes.STRING(20),
      unique: true,
      allowNull: false,
    },
  },
  { sequelize: db, modelName: 'members' }
);

Booking.init(
  {
    startTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  { sequelize: db, modelName: 'bookings' }
);

Member.belongsTo(Member, { as: 'sponsor' });
Member.hasMany(Member, { as: 'sponsorees', foreignKey: 'sponsorId' });
Booking.belongsTo(Member, { as: 'bookedBy' });
Booking.belongsTo(Facility);
Member.hasMany(Booking, { foreignKey: 'bookedById' });

const syncAndSeed = async () => {
  const [lucy, moe, larry] = await Promise.all(
    ['lucy', 'moe', 'larry'].map((mem) => new Member({ first_name: mem }))
  );
  await Promise.all([lucy.save(), moe.save(), larry.save()]);
  lucy.sponsorId = moe.id;
  larry.sponsorId = moe.id;
  await Promise.all([lucy.save(), larry.save()]);
  const [tennis1, tennis2] = await Promise.all(
    ['Tennis Court 1', 'Tennis Court 2'].map(
      (fac) => new Facility({ fac_name: fac })
    )
  );
  await Promise.all([tennis1.save(), tennis2.save()]);
  const start1 = new Date('February 20, 2021 17:00:00'),
    end1 = new Date('February 20, 2021 18:00:00'),
    start2 = new Date('February 23, 2021 11:00:00'),
    end2 = new Date('February 23, 2021 11:30:00'),
    start3 = new Date('February 27, 2021 12:00:00'),
    end3 = new Date('February 27, 2021 14:00:00');
  const [booking1, booking2, booking3] = await Promise.all(
    [
      [start1, end1],
      [start2, end2],
      [start3, end3],
    ].map(([start, end]) => new Booking({ startTime: start, endTime: end }))
  );
  booking1.bookedById = lucy.id;
  booking2.bookedById = larry.id;
  booking3.bookedById = moe.id;
  booking1.facilityId = tennis1.id;
  booking2.facilityId = tennis1.id;
  booking3.facilityId = tennis2.id;
  await Promise.all([booking1.save(), booking2.save(), booking3.save()]);
};

module.exports = { db, syncAndSeed, models: { Member, Facility, Booking } };
