module.exports = function(sequelize, DataTypes) {
  var Company = sequelize.define("Company", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1]
      }
    },
    twitter: {
      type: DataTypes.STRING,
      allowNull: true
    },
    instagram: {
      type: DataTypes.STRING,
      allowNull: true
    },
    facebook: {
      type: DataTypes.STRING,
      allowNull: true
    },
    about: {
      type: DataTypes.STRING,
      allowNull: true
    },
    yelp: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: true
      }
    },
    google: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: true
      }
    },
    bbb: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: true
      }
    }
  });

  Company.associate = function(models) {
    // We're saying that a Company should belong to a User
    // A Company can't be created without a User due to the foreign key constraint
    Company.belongsTo(models.Users, {
      foreignKey: {
        allowNull: false
      }
    });

    // Associating Contacts with Companies
    Company.hasMany(models.Contact);
  };

  return Company;
};
