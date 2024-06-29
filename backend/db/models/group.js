'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Group extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
     Group.belongsTo(models.User, {
      foreignKey:'organizerId',
      as: 'Organizer'
     });
     Group.hasMany(models.Membership, {
      foreignKey: 'groupId'
     });
     Group.hasMany(models.GroupImage, {
      foreignKey:'groupId',as:'previewImage'
     });
     Group.hasMany(models.GroupImage, {
      foreignKey:'groupId'
     });
     Group.hasMany(models.Venue, {
      foreignKey:'groupId'
     });
     Group.hasMany(models.Event,{
      foreignKey:'groupId'
     })
    }
  }
  Group.init({
    organizerId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Users'
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len:[0,60]
      }
    },
    about: DataTypes.TEXT,
    type: {
      type: DataTypes.ENUM,
      values: ['In person','Online']
    },
    private: DataTypes.BOOLEAN,
    city: DataTypes.STRING,
    state: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Group',
  });
  return Group;
};