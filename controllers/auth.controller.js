const models = require('../models');
const User = models.User;
const Role = models.Role;
const Image = models.Image;
const bcrypt = require("bcrypt");
const jsonwebtoken = require("jsonwebtoken");
const Response = require("../helpers/response");
const Message = require("../helpers/errormessage");

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
     * @returns {Promise<[*, *]>}
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
        return Response.sendResponse(user, 201);
    }


    /**
     * @param login
     * @param password
     * @returns {Promise<[*, *]>}
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
                    const error = new Message("Votre inscription n'a pas encore été validée")
                    return Response.sendResponse(error, 401)
                }
                if (userFound.validForUser === "REFUSE") {
                    const error = new Message("Votre inscription a été refusée")
                    return Response.sendResponse(error, 401)

                }
                if (userFound.active) {
                    return Response.sendResponse(await userFound.save(), 200)
                } else if (!userFound.active) {
                    const error = new Message("Vous avez été banni de ce site")
                    return Response.sendResponse(error, 401)
                }
            }
        }
        const error = new Message("L' email ou le mot de passe est incorrect")
        return Response.sendResponse(error, 400)
    }


}

module.exports = AuthController;
