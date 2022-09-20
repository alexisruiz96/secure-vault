import { JwtPayload, verify as verifyJwt } from 'jsonwebtoken';
import * as passport from 'passport';
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';
import { Strategy as LocalStrategy } from 'passport-local';
import { QueryResult } from 'pg';

import { userQuery } from '../db/userQuery';
import { i18n } from '../i18n/i18n';
import { jwtSecret } from './config';

/**
 * Initialize passports configuration
 * @param passport
 */
export const initializePassportConfig = (passport: passport.PassportStatic) => {
    const authenticateUser = async (
        username: string,
        password: string,
        done: Function
    ) => {
        try {
            const responseValidUser: QueryResult = await userQuery.validateUser(
                { username, password }
            );

            const isUserLoggedIn: boolean = responseValidUser.rows[0].exists;
            if (!isUserLoggedIn)
                return done(null, false, {
                    message: i18n.loginError,
                });

            const response: QueryResult = await userQuery.getUserByUsername(
                username
            );
            return done(null, response.rows[0].id);
        } catch (error) {
            done(null, false, { message: i18n.loginError });
        }
    };

    const validateJwtOnAuthenticationHeader = async (
        jwtPayload: JwtPayload,
        done: Function
    ) => {
        try {
            if (jwtPayload.sub === undefined || jwtPayload.sub === "")
                throw Error;
            const response: QueryResult = await userQuery.getUserByUsername(
                jwtPayload.sub as string
            );
            if (response.rowCount === 0) {
                return done(null, false);
            }
            return done(null, response.rows[0].id);
        } catch (error) {
            done(error);
        }
    };

    passport.use("local", new LocalStrategy(authenticateUser));
    passport.use(
        "jwt",
        new JwtStrategy(
            {
                jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme("jwt"),
                secretOrKey: jwtSecret,
            },
            validateJwtOnAuthenticationHeader
        )
    );
    passport.serializeUser((user: any, done) => {
        done(null, user.id);
    });
    passport.deserializeUser((id, done) =>
        done(null, userQuery.getUserById(id as number))
    );
};
