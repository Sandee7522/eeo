// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";

// export async function hashPassword(password) {
//   return await bcrypt.hash(password, 10);
// }

// export async function verifyPassword(password, hashedPassword) {
//   return await bcrypt.compare(password, hashedPassword);
// }

// export function generateToken(userId, email, role) {
//   return jwt.sign({ userId, email, role }, process.env.JWT_SECRET, {
//     expiresIn: process.env.JWT_EXPIRY || "7d",
//   });
// }

// export function verifyToken(token) {
//   try {
//     return jwt.verify(token, process.env.JWT_SECRET);
//   } catch (error) {
//     return null;
//   }
// }
