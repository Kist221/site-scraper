module.exports = function(sequelize, DataTypes) {
  var Contact = sequelize.define("Contact", {
    // Giving the Contact model a name of type STRING
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1]
      }
    },
    // Giving the Contact model a name of type BOOLEAN
    gender: {
      type: DataTypes.BOOLEAN
    },
    // Giving the Contact model an email of type STRING
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    // Giving the Contact model a phone of type STRING
    phone: {
      type: DataTypes.STRING,
      validate: {
        len:[10,20]
      }
    },

    // status - 0: a review request was not sent
    // status - 1: a review request was sent
    // status - 2: the contact submitted a review
    // status - 3: the contact opened but did not leave a review
    status: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },

    // is the contact still active
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },

     // the contacts review
    review: {
      type: DataTypes.TEXT,
    },

    // review type 0: negative review, 1: positive review
    reviewType: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },

  });

  Contact.associate = function(models) {
    // We're saying that a Contact should belong to a Company
    // A Contact can't be created without a Company due to the foreign key constraint
    Contact.belongsTo(models.Company, {
      foreignKey: {
        allowNull: false
      }
    });
  };

  return Contact;
};

