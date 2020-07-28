const models = require('../models');
const User = models.User;
const Role = models.Role;
const Image = models.Image;
const bcrypt = require("bcrypt");
const jsonwebtoken = require("jsonwebtoken");

class AuthController {

    /**
     * @param login
     * @param firstname
     * @param email
     * @param lastname
     * @param password
     * @param street
     * @param zipCode
     * @param city
     * @param phone
     * @param roleId
     * @param birthdate
     * @returns {Promise<User>}
     */
    static async subscribe(login, firstname, email, lastname, password, street, zipCode, city, phone, roleId, birthdate) {

        const role = await Role.findOne({
            where: {
                id: roleId
            }
        });
        let validForVolunteer = null;
        if (role.id === 2) {
            validForVolunteer = "ATTENTE";
        }
        let validForUser = "ATTENTE";
        const user = await User.create({
            login,
            firstname,
            email,
            lastname,
            street,
            zipCode,
            city,
            phone,
            validForUser: validForUser,
            password: await bcrypt.hash(password, 10),
            active: true,
            birthdate: birthdate,
            validForVolunteer: validForVolunteer,

        });
        await user.setRole(role);
        return user;
    }


    /**
     * @param login
     * @param password
     * @returns {Promise<string>}
     */
    static async login(login, password) {
        const userFound = await User.findOne({
            where: {
                login: login
            }
        });
        if (userFound) {
            const isCorrect = await bcrypt.compare(password, userFound.password);
            if (isCorrect) {
                const token = jsonwebtoken.sign({
                        email: userFound.email,
                        userId: userFound.id,
                        role: userFound.RoleId
                    },
                    'secret',
                    {
                        expiresIn: "1h"
                    }
                );
                userFound.token = token;
                if (userFound.validForUser === "ATTENTE") {
                    return {
                        message: "Votre inscription n'a pas encore été validée"
                    };
                }
                if (userFound.validForUser === "REFUSE") {
                    return {
                        message: "Votre inscription a été refusée"
                    };
                }
                if (userFound.active) {

                    return userFound.save();


                } else if (!userFound.active) {
                    return {
                        message: "Vous avez été banni de ce site"
                    };
                }
            }
        }
        return {
            message: "L' email ou le mot de passe est incorrect"
        };
    }


}

module.exports = AuthController;
