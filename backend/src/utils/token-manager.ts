import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { COOKIE_NAME } from "./constants.js";

export const createToken = (id: string, email: string, expiresIn: string) => {
	const payload = { id, email };

	const token = jwt.sign(payload, process.env.JWT_SECRET, {
		expiresIn,
	});

	return token;
};

export const verifyToken = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const token = req.signedCookies[`${COOKIE_NAME}`]; // signed cookies is an object which can contain all of the cookies data
	if (!token || token.trim() === "") {
		return res.status(401).json({ message: "Token Not Received" });
	}
	return new Promise<void>((resolve, reject) => {
		return jwt.verify(
			token,
			process.env.JWT_SECRET,
			(err: any, success: any) => {
				if (err) {
					reject(err.message);
					return res.status(401).json({ message: "Token Expired" });
				} else {
					resolve();
					res.locals.jwtData = success;
					return next();
				}
			}
		);
	});
};
