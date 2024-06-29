'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Event extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Event.hasMany(models.Attendance, {
        foreignKey: 'eventId'
      });
      Event.hasMany(models.EventImage, {
        foreignKey:'eventId'
      });
      Event.hasMany(models.EventImage, {
        foreignKey:'eventId', as: 'previewImage'
      });
      Event.belongsTo(models.Group, {
        foreignKey:'groupId'
      });
      Event.belongsTo(models.Venue, {
        foreignKey:'venueId'
      })
    }
  }
  Event.init({
    venueId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Venues'
      }
    },
    groupId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Groups'
      }
    },
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
    type: {
      type: DataTypes.ENUM,
      values:['Online','In person']
    },
    capacity: DataTypes.INTEGER,
    price: DataTypes.FLOAT,
    startDate: DataTypes.DATE,
    endDate: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Event',
  });
  return Event;
};