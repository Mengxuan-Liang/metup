'use strict';
const {
  Model, Validator
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Group, {
        foreignKey:'organizerId', as:'Organizer'
      });
      User.hasMany(models.Membership, {
        foreignKey: 'userId'
      });
      User.hasMany(models.Attendance, {
        foreignKey:'userId'
      })
    }
  }
  User.init({
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { // validation rule
        len:[4,30],
        isNotEmail(value){
          if(Validator.isEmail(value)){
            throw new Error('Cannot be an email')
          }
        }
      }
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len:[3, 256],
        isEmail: true
      }
    },
    hashedPassword: {
      type: DataTypes.STRING,
      allowNull:false,
      validate: {
        len:[60,60]
      }
    }
  }, {
    sequelize,
    modelName: 'User',
    defaultScope: { //To ensure that a user's information like their hashedPassword doesn't get sent to the frontend, you should define User model scopes.
      attributes: {
        exclude:['hashedPassword','email','createdAt','updatedAt']
      }
    }
  });
  return User;
};